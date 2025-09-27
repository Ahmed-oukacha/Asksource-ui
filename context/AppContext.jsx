"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = ()=>{
    return useContext(AppContext)
}

export const AppContextProvider = ({children})=>{
    const {user} = useUser()
    const {getToken} = useAuth()

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const createNewChat = async ()=>{
        try {
            if(!user) return null;

            const token = await getToken();

            await axios.post('/api/chat/create', {}, {headers:{
                Authorization: `Bearer ${token}`
            }})

            fetchUsersChats();
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUsersChats = async ()=>{
        try {
            const token = await getToken();
            const {data} = await axios.get('/api/chat/get', {headers:{
                Authorization: `Bearer ${token}`
            }})
            if(data.success){
                console.log(data.data);
                setChats(data.data)

                 // If the user has no chats, create one
                 if(data.data.length === 0){
                    await createNewChat();
                    return fetchUsersChats();
                 }else{
                    // sort chats by updated date
                    data.data.sort((a, b)=> new Date(b.updatedAt) - new Date(a.updatedAt));

                     // set recently updated chat as selected chat
                     setSelectedChat(data.data[0]);
                     console.log(data.data[0]);
                 }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Mettez cette fonction en commentaire pour le moment, nous l'activerons plus tard
    const fetchProjects = async () => {
        // Ajout de projets factices pour le test
        const dummyProjects = [
            { _id: 'proj1', project_id: 'Projet Alpha' },
            { _id: 'proj2', project_id: 'Rapport Annuel Q3' },
            { _id: 'proj3', project_id: 'Données Techniques' },
        ];
        setProjects(dummyProjects);
        if (dummyProjects.length > 0 && !selectedProject) {
            setSelectedProject(dummyProjects[0]);
        }
    };

 useEffect(()=>{
    if(user){
        fetchUsersChats();
        fetchProjects();
    }
 }, [user])

    const value = {
        user,

        // États et fonctions pour les chats
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUsersChats,
        createNewChat,

        // États et fonctions pour les projets
        projects,
        setProjects,
        selectedProject,
        setSelectedProject,
        fetchProjects
    }
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}