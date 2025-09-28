// Fichier: components/ProjectModal.jsx

import React, { useState, useEffect } from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProjectModal = ({ isOpen, onClose, onConfirm }) => {
    // Si le modal n'est pas ouvert, ne rien rendre
    if (!isOpen) return null;

    const { projects, selectedProject, setSelectedProject } = useAppContext();
    const [tempSelectedProject, setTempSelectedProject] = useState(selectedProject);
    const [searchTerm, setSearchTerm] = useState('');

    // Synchroniser la sélection temporaire avec le projet sélectionné global à chaque ouverture du modal
    useEffect(() => {
        if (isOpen) {
            setTempSelectedProject(selectedProject ? { ...selectedProject } : null);
        }
    }, [isOpen, selectedProject]);

    // Filtrer les projets selon le terme de recherche
    const filteredProjects = projects.filter(project =>
        project.project_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirm = () => {
    setSelectedProject(tempSelectedProject);
    onConfirm && onConfirm(tempSelectedProject);
    onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
        >
            <div 
                className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
            >
                {/* En-tête moderne */}
                <div className="flex justify-between items-center p-5 border-b border-black/10">
                    <h2 className="text-xl font-semibold text-gray-900">Sélectionner un Projet</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                        <Image src={assets.sidebar_close_icon} alt="Fermer" width={20} height={20} className="invert opacity-60" />
                    </button>
                </div>

                {/* Barre de recherche moderne */}
                <div className="p-4 flex items-center gap-3 border-b border-black/10">
                    <div className="relative flex-grow">
                        <input 
                            type="search"
                            placeholder="Rechercher un projet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Liste des projets filtrés */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                        {filteredProjects.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">Aucun projet trouvé.</div>
                        ) : (
                            // Correction: Utiliser 'id' au lieu de '_id' pour l'identifiant du projet
                            filteredProjects.map((project) => {
                                const isSelected = tempSelectedProject && tempSelectedProject.id === project.id; // Comparaison avec 'id'
                                return (
                                    <div 
                                        key={project.id} // Utilisation de 'id' comme clé unique
                                        onClick={() => setTempSelectedProject({ ...project })}
                                        className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                            isSelected
                                            ? 'bg-primary text-white shadow-lg scale-105'
                                            : 'bg-white text-gray-800 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{project.project_id}</span>
                                        {isSelected && (
                                            <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                        )}
                                    </div>
                                );
                            })
                        )}
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