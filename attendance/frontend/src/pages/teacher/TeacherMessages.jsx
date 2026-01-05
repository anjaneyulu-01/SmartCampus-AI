import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Inbox, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { axiosApi, useAuthStore } from '../../stores'

export default function TeacherMessages() {
  const user = useAuthStore((s) => s.user)
  const [inbox, setInbox] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [compose, setCompose] = useState({ subject: '', body: '' })

  const role = user?.role
  const recipientDefault = role === 'hod' ? '' : 'hod'

  const load = async () => {
    try {
      setLoading(true)
      const [inboxRes, sentRes] = await Promise.all([
        axiosApi.get('/teacher/messages/inbox'),
        axiosApi.get('/teacher/messages/sent'),
      ])
      setInbox(inboxRes.data || [])
      setSent(sentRes.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    try {
      if (!compose.body.trim()) {
        toast.error('Message body is required')
        return
      }
      setSending(true)
      await axiosApi.post('/teacher/messages', {
        recipient: recipientDefault || 'hod',
        subject: compose.subject || 'No subject',
        body: compose.body,
      })
      toast.success('Message sent')
      setCompose({ subject: '', body: '' })
      load()
    } catch (e) {
      console.error(e)
      toast.error(e?.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const formatTime = useMemo(() => (ts) => {
    if (!ts) return ''
    try {
      const d = new Date(ts)
      return d.toLocaleString()
    } catch {
      return ts
    }
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <p className="text-gray-300">Inbox, sent, and compose</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-300">
          {loading && <Loader2 className="animate-spin" size={16} />}<span>{loading ? 'Refreshing...' : ''}</span>
        </div>
      </div>

      {/* Compose */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Send size={16} className="text-green-400" />
          Compose to HOD
        </div>
        <input
          value={compose.subject}
          onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))}
          placeholder="Subject"
          className="input-field"
        />
        <textarea
          value={compose.body}
          onChange={(e) => setCompose((c) => ({ ...c, body: e.target.value }))}
          placeholder="Message"
          rows={4}
          className="input-field"
        />
        <div className="flex justify-end">
          <button
            onClick={sendMessage}
            disabled={sending}
            className="btn-primary flex items-center gap-2"
          >
            {sending && <Loader2 className="animate-spin" size={16} />}
            Send
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inbox */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Inbox size={16} className="text-green-400" />
            Inbox
          </div>
          {(inbox || []).length === 0 && (
            <div className="text-gray-400 text-sm">No messages</div>
          )}
          {(inbox || []).map((m) => (
            <div key={m.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div className="flex justify-between text-white font-semibold">
                <span>From: {m.sender}</span>
                <span className="text-xs text-gray-300">{formatTime(m.created_at)}</span>
              </div>
              <div className="text-sm text-gray-200">{m.subject || 'No subject'}</div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{m.body}</div>
            </div>
          ))}
        </div>

        {/* Sent */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Send size={16} className="text-green-400" />
            Sent
          </div>
          {(sent || []).length === 0 && (
            <div className="text-gray-400 text-sm">No sent messages</div>
          )}
          {(sent || []).map((m) => (
            <div key={m.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div className="flex justify-between text-white font-semibold">
                <span>To: {m.recipient}</span>
                <span className="text-xs text-gray-300">{formatTime(m.created_at)}</span>
              </div>
              <div className="text-sm text-gray-200">{m.subject || 'No subject'}</div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{m.body}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
