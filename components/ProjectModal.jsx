// Fichier: components/ProjectModal.jsx

import React, { useState } from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';

const ProjectModal = ({ isOpen, onClose, onConfirm }) => {
    // Si le modal n'est pas ouvert, ne rien rendre
    if (!isOpen) return null;

    // Données factices pour la conception de l'interface utilisateur
    const dummyProjects = [
        { _id: '1', project_id: 'Projet Alpha' },
        { _id: '2', project_id: 'Rapport Annuel Q3' },
        { _id: '3', project_id: 'Données Techniques' },
        { _id: '4', project_id: 'Archive Générale' },
    ];

    // État temporaire pour la sélection dans le modal
    const [tempSelectedProject, setTempSelectedProject] = useState(dummyProjects[0]);

    const handleConfirm = () => {
        onConfirm(tempSelectedProject); // Confirmer la sélection
        onClose(); // Fermer le modal
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
        >
            <div 
                className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
            >
                {/* En-tête */}
                <div className="flex justify-between items-center p-5 border-b border-black/10">
                    <h2 className="text-xl font-semibold text-gray-900">Sélectionner un Projet</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                        <Image src={assets.sidebar_close_icon} alt="Fermer" width={20} height={20} className="invert opacity-60" />
                    </button>
                </div>

                {/* Liste des projets */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                        {dummyProjects.map((project) => (
                            <div 
                                key={project._id} 
                                onClick={() => setTempSelectedProject(project)}
                                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                    tempSelectedProject?._id === project._id 
                                    ? 'bg-primary text-white shadow-lg scale-105' 
                                    : 'bg-white/50 hover:bg-white/80 text-gray-800'
                                }`}
                            >
                                <span className="font-semibold">{project.project_id}</span>
                                {tempSelectedProject?._id === project._id && (
                                     <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pied de page avec les boutons */}
                <div className="flex justify-end items-center p-5 bg-black/5 border-t border-black/10 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-transparent rounded-lg hover:bg-black/10 transition-colors mr-2">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50">
                        Sélectionner
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.3s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
            `}</style>
        </div>
    );
};

export default ProjectModal;