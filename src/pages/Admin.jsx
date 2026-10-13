import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { REPORT_REASONS, STATUS_LABEL } from '../lib/constants'

const count = (table, f) => { let q = supabase.from(table).select('*', { count: 'exact', head: true }); if (f) q = f(q); return q.then((r) => r.count ?? 0) }

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setData(null)
    if (tab === 'overview') {
      const [users, events, pending, approved, rejected, reports] = await Promise.all([
        count('profiles'), count('events'), count('events', (q) => q.eq('status', 'pending')), count('events', (q) => q.eq('status', 'approved')),
        count('events', (q) => q.eq('status', 'rejected')), count('event_reports', (q) => q.eq('status', 'open'))])
      setData({ users, events, pending, approved, rejected, reports })
    } else if (tab === 'users') setData((await supabase.from('profiles').select('*').order('staff_requested', { ascending: false }).order('created_at', { ascending: false }).limit(200)).data || [])
    else if (tab === 'events') setData((await supabase.from('events').select('id,title,college_name,status,is_demo,is_featured,created_at').order('created_at', { ascending: false }).limit(100)).data || [])
    else if (tab === 'reports') setData((await supabase.from('event_reports').select('*, events(title,status), reporter:profiles!event_reports_reporter_id_fkey(full_name)').order('created_at', { ascending: false }).limit(100)).data || [])
    else if (tab === 'duplicates') setData((await supabase.from('duplicate_events').select('*')).data || [])
    else if (tab === 'audit') setData((await supabase.from('audit_logs').select('*, actor:profiles!audit_logs_actor_id_fkey(full_name)').order('created_at', { ascending: false }).limit(100)).data || [])
  }
  useEffect(() => { load() }, [tab])

  const run = async (p) => { setMsg(''); const { error } = await p; if (error) setMsg(error.message); else load() }
  const remove = (id) => { const note = prompt('Reason for removing this event?'); if (note) run(supabase.rpc('review_event', { p_event_id: id, p_action: 'remove', p_note: note })) }
  const tabs = ['overview', 'users', 'events', 'reports', 'duplicates', 'audit']

  return (
    <div className="container">
      <h1>Admin dashboard</h1>
      <div className="tabs">{tabs.map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      {msg && <p className="alert">{msg}</p>}
      {data === null ? <p className="muted">Loading…</p> : <>
        {tab === 'overview' && <div className="stats">{Object.entries({ 'Total users': data.users, 'Total events': data.events, 'Pending': data.pending, 'Approved': data.approved, 'Rejected': data.rejected, 'Open reports': data.reports }).map(([k, v]) => <div key={k} className="card stat"><b>{v}</b><span>{k}</span></div>)}</div>}
        {tab === 'users' && <div className="list">{data.map((u) => (
          <div key={u.id} className="card row-item"><div><b>{u.full_name || '(no name)'}</b> {u.is_suspended && <span className="badge inline st-rejected">Suspended</span>}{u.staff_requested && <span className="badge inline st-pending">Staff requested</span>}<p className="muted">{u.college_name} · {u.district}</p></div>
            <div className="row"><select value={u.role} disabled={u.id === user.id} onChange={(e) => run(supabase.rpc('admin_set_role', { p_user: u.id, p_role: e.target.value }))}><option value="student">student</option><option value="staff">staff</option><option value="admin">admin</option></select>
              <button className="btn ghost danger" disabled={u.id === user.id} onClick={() => run(supabase.rpc('admin_set_suspended', { p_user: u.id, p_suspended: !u.is_suspended }))}>{u.is_suspended ? 'Unsuspend' : 'Suspend'}</button></div></div>))}</div>}
        {tab === 'events' && <div className="list">{data.map((e) => (
          <div key={e.id} className="card row-item"><div><Link to={`/events/${e.id}`}><b>{e.title}</b></Link> {e.is_demo && <span className="badge inline demo">DEMO</span>}<br /><span className={`badge inline st-${e.status}`}>{STATUS_LABEL[e.status]}</span><p className="muted">{e.college_name}</p></div>
            <div className="row">{e.status === 'approved' && <button className="btn ghost" onClick={() => run(supabase.rpc('admin_set_featured', { p_event: e.id, p_featured: !e.is_featured }))}>{e.is_featured ? '★ Unfeature' : '☆ Feature'}</button>}
              {e.status !== 'removed' && <button className="btn ghost danger" onClick={() => remove(e.id)}>Remove</button>}</div></div>))}</div>}
        {tab === 'reports' && (data.length === 0 ? <p className="empty">No reports.</p> : <div className="list">{data.map((r) => (
          <div key={r.id} className="card row-item"><div><Link to={`/events/${r.event_id}`}><b>{r.events?.title}</b></Link> <span className="badge inline st-pending">{r.status}</span><p>{REPORT_REASONS[r.reason]}{r.details ? `: ${r.details}` : ''}</p><p className="muted">By {r.reporter?.full_name || 'user'}</p></div>
            {r.status === 'open' && <div className="row"><button className="btn ghost" onClick={() => run(supabase.from('event_reports').update({ status: 'resolved', handled_by: user.id }).eq('id', r.id))}>Resolve</button><button className="btn ghost" onClick={() => run(supabase.from('event_reports').update({ status: 'dismissed', handled_by: user.id }).eq('id', r.id))}>Dismiss</button></div>}</div>))}</div>)}
        {tab === 'duplicates' && (data.length === 0 ? <p className="empty">No likely duplicates found (same title + college + date).</p> : <div className="list">{data.map((d, i) => <div key={i} className="card"><b>{d.title_key}</b> · {d.college_key} · {d.event_date} · {d.copies} copies<br />{d.event_ids.map((id) => <Link key={id} to={`/events/${id}`}> {id.slice(0, 8)} </Link>)}</div>)}</div>)}
        {tab === 'audit' && (data.length === 0 ? <p className="empty">No audit entries yet.</p> : <div className="list">{data.map((a) => <div key={a.id} className="card"><b>{a.action}</b> on {a.target_type} {a.target_id?.slice(0, 8)} by {a.actor?.full_name || 'system'}<br /><small className="muted">{new Date(a.created_at).toLocaleString()}</small></div>)}</div>)}
      </>}
    </div>
  )
}
