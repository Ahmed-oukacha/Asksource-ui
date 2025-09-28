import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ProjectModal from './ProjectModal';

const PromptBox = ({ setIsLoading, isLoading }) => {
    // Tous les hooks doivent être déclarés au début du composant pour éviter les erreurs React internes
    const [prompt, setPrompt] = useState('');
    const { user, chats, setChats, selectedChat, setSelectedChat, selectedProject, setSelectedProject } = useAppContext();
    const [searchMode, setSearchMode] = useState('hybrid');
    const [limit, setLimit] = useState(3);
    const [denseLimit, setDenseLimit] = useState(10);
    const [sparseLimit, setSparseLimit] = useState(3);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(e);
        }
    };

    // Version finale propre de sendPrompt
    const sendPrompt = async (e) => {
        e.preventDefault();
        const promptCopy = prompt;
        try {
            if (!user) return toast.error('Veuillez vous connecter pour envoyer un message');
            if (isLoading) return toast.error('Veuillez attendre la réponse précédente');
            if (!selectedProject) return toast.error('Veuillez sélectionner un projet avant d\'envoyer un message.');

            setIsLoading(true);
            setPrompt("");

            const userPrompt = {
                role: "user",
                content: promptCopy,
                timestamp: Date.now(),
            };
            setSelectedChat((prev) => ({ ...prev, messages: [...prev.messages, userPrompt] }));
            setChats((prevChats) => prevChats.map((chat) => chat._id === selectedChat._id ? { ...chat, messages: [...chat.messages, userPrompt] } : chat));

            // Préparation du corps de la requête pour notre nouveau proxy API
            // const requestBody = {
            //     prompt: promptCopy,
            //     projectId: selectedProject.project_id,
            //     searchMode: searchMode,
            //     limit: limit,
            //     denseLimit: denseLimit,
            //     sparseLimit: sparseLimit,
            // };

            // // Appel à notre nouvelle API proxy
            // const { data } = await axios.post('/api/asksource', requestBody);
            let targetUrl = '';
            let payload = {};
            const projectId = selectedProject.project_id;

            switch (searchMode) {
                case 'simple':
                    targetUrl = `/api/nlp/index/answer_search/${projectId}`;
                    payload = { text: promptCopy, limit };
                    break;
                case 'hybrid':
                    targetUrl = `/api/nlp/index/answer_hybrid/${projectId}`;
                    payload = { text: promptCopy, dense_limit: denseLimit, sparse_limit: sparseLimit, limit };
                    break;
                case 'advanced':
                    targetUrl = `/api/nlp/index/answer_hybrid_cross/${projectId}`;
                    payload = { text: promptCopy, dense_limit: denseLimit, sparse_limit: sparseLimit, limit };
                    break;
            }

            // استدعاء الرابط المباشر الذي ستقوم Vercel بتحويله
            const { data } = await axios.post(targetUrl, payload);


            if (data.signal === "rag_answer_success") {
                const assistantMessage = { role: 'assistant', content: data.answer, timestamp: Date.now() };
                setSelectedChat((prev) => ({ ...prev, messages: [...prev.messages, assistantMessage] }));
                setChats((prevChats) => prevChats.map((chat) => chat._id === selectedChat._id ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat));
            } else {
                toast.error(data.signal  || "Une erreur est survenue.");
                setSelectedChat(prev => ({ ...prev, messages: prev.messages.slice(0, -1) }));
                setPrompt(promptCopy);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Une erreur inattendue est survenue.");
            setSelectedChat(prev => ({ ...prev, messages: prev.messages.slice(0, -1) }));
            setPrompt(promptCopy);
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <form onSubmit={sendPrompt} className={`w-full ${selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"} bg-white border border-gray-200 p-4 rounded-3xl mt-4 transition-all`}>
            <textarea
                onKeyDown={handleKeyDown}
                className='outline-none w-full resize-none overflow-hidden break-words bg-transparent placeholder:text-gray-500'
                rows={2}
                placeholder='Envoyer un message à Asksource'
                required
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
            />
            <div className='flex items-end justify-between gap-4 mt-4'>
                {/* Côté gauche : Boutons de mode de recherche */}
                <div className='flex-shrink-0'>
                    <div className='flex items-center gap-1 bg-gray-100 p-1 rounded-lg h-8'>
                        <button type="button" onClick={() => setSearchMode('simple')} className={`px-3 py-1 text-xs rounded-md transition-all duration-300 ${searchMode === 'simple' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>
                            Simple
                        </button>
                        <button type="button" onClick={() => setSearchMode('hybrid')} className={`px-3 py-1 text-xs rounded-md transition-all duration-300 ${searchMode === 'hybrid' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>
                            Hybride
                        </button>
                        <button type="button" onClick={() => setSearchMode('advanced')} className={`px-3 py-1 text-xs rounded-md transition-all duration-300 ${searchMode === 'advanced' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>
                            Avancé
                        </button>
                    </div>
                </div>
                {/* Section centrale : Sélection de projet et paramètres */}
                <div className="flex-grow flex items-end justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 h-8 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <Image src="/file.svg" alt="Project Icon" width={14} height={14} className="opacity-60"/>
                        <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Projects</span>
                    </button>
                    <div className='flex items-center gap-3'>
                        <div className='relative'>
                            <input 
                                type="number" 
                                id="limit"
                                value={limit} 
                                onChange={(e) => setLimit(Math.max(3, Number(e.target.value)))} 
                                min="3"
                                placeholder=" "
                                className="peer w-15 h-8 text-center text-sm p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none" 
                            />
                            <label 
                                htmlFor="limit" 
                                className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                            >
                                Limit
                            </label>
                        </div>
                        <div className='relative'>
                            <input 
                                type="number" 
                                id="denseLimit"
                                value={denseLimit} 
                                onChange={(e) => setDenseLimit(Math.max(3, Number(e.target.value)))} 
                                min="3"
                                placeholder=" "
                                disabled={searchMode === 'simple'} 
                                className="peer w-15 h-8 text-center text-sm p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
                            />
                            <label 
                                htmlFor="denseLimit" 
                                className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 ${searchMode === 'simple' ? 'text-gray-300' : 'text-gray-400'}`}
                            >
                                Dense
                            </label>
                        </div>
                        <div className='relative'>
                            <input 
                                type="number" 
                                id="sparseLimit"
                                value={sparseLimit} 
                                onChange={(e) => setSparseLimit(Math.max(3, Number(e.target.value)))} 
                                min="3"
                                placeholder=" "
                                disabled={searchMode === 'simple'} 
                                className="peer w-15 h-8 text-center text-sm p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
                            />
                            <label 
                                htmlFor="sparseLimit" 
                                className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 ${searchMode === 'simple' ? 'text-gray-300' : 'text-gray-400'}`}
                            >
                                Sparse
                            </label>
                        </div>
                    </div>
                </div>
                {/* Côté droit : Icônes d'action */}
                <div className='flex-shrink-0'>
                    <div className='flex items-center gap-2'>
                        <button 
                            type="submit" 
                            disabled={!prompt || !selectedProject}
                            className={`${(prompt && selectedProject) ? "bg-primary" : "bg-gray-300 cursor-not-allowed"} rounded-full p-2.5 transition-colors`}
                        >
                            <Image className='w-3 h-3 aspect-square' src={(prompt && selectedProject) ? assets.arrow_icon : assets.arrow_icon_dull} alt='Send Icon'/>
                        </button>
                    </div>
                </div>
            </div>
            <ProjectModal 
                // On passe les props de façon statique pour éviter les erreurs React internes
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={setSelectedProject}
            />
        </form>
    );
};

export default PromptBox;