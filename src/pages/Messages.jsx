import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bug, Lightbulb, Trash2, ArrowLeft, Calendar, Mail, Loader2 } from 'lucide-react';
import Loader from '../components/Loader';

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Seguridad: Redirigir si no es el admin principal
    useEffect(() => {
        if (user && user.email !== 'juandiegoarchilaeon@gmail.com') {
            navigate('/admin');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user || user.email !== 'juandiegoarchilaeon@gmail.com') return;
            try {
                const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const msgs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(msgs);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [user]);

    const handleDelete = async (id) => {
        if(window.confirm('¿Eliminar este mensaje?')) {
            try {
                await deleteDoc(doc(db, 'feedback', id));
                setMessages(prev => prev.filter(m => m.id !== id));
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    }

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Buzón de Mensajes</h1>
                        <p className="text-slate-500 text-sm">Feedback recibido de usuarios y visiteurs</p>
                    </div>
                    <span className="ml-auto bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                        {messages.length}
                    </span>
                </div>

                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No hay mensajes todavía.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        {msg.type === 'bug' && <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><Bug size={12} /> Bug</span>}
                                        {msg.type === 'improvement' && <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><Lightbulb size={12} /> Idea</span>}
                                        {msg.type === 'opinion' && <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><MessageSquare size={12} /> Opinión</span>}
                                        
                                        <span className="text-slate-400 text-xs flex items-center gap-1 font-mono ml-2">
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                                        </span>
                                    </div>
                                    <button onClick={() => handleDelete(msg.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg" title="Eliminar">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed mb-4 text-sm sm:text-base font-medium">
                                    "{msg.message}"
                                </p>

                                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 border-t pt-3 mt-2 items-center">
                                    {msg.email && (
                                        <div className="flex items-center gap-1.5">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{msg.email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-400">Origen:</span> {msg.source}
                                    </div>
                                    {msg.url && (
                                         <a href={msg.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-500 hover:underline max-w-[150px] truncate hidden sm:block">
                                            {msg.url}
                                         </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;