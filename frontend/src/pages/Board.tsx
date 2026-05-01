import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BoardFile } from '../types';
import { boardService } from '../services/boardService';
import { BoardUpload } from "../components/BoardUpload";
import api from "../services/api";
import toast from "react-hot-toast";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

export const Board: React.FC = () => {
  const { user } = useContext(AuthContext);

  const [files, setFiles] = useState<BoardFile[]>([]);
  const [loading, setLoading] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"true" | "false">("true");

  // ricerca
  const [search, setSearch] = useState("");

  // ordinamento dinamico (backend)
  const [sortBy, setSortBy] = useState("upload_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  // paginazione
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // filtro per sito
  const [siteFilter, setSiteFilter] = useState<number | "all">("all");
  const [sites, setSites] = useState<any[]>([]);

  // modifica siti
  const [showEditSites, setShowEditSites] = useState(false);
  const [editFile, setEditFile] = useState<BoardFile | null>(null);
  const [allSites, setAllSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);

  useEffect(() => {
    fetchFiles(activeFilter);

    api.get("/api/v1/sites")
      .then(res => setSites(res.data))
      .catch(() => toast.error("Errore nel caricamento dei siti"));
  }, []);

  const fetchFiles = async (active: "true" | "false") => {
    try {
      const res = await api.get(
        `/api/v1/board?active=${active}&sort_by=${sortBy}&direction=${direction}`
      );
      setFiles(res.data);
    } catch {
      toast.error("Errore nel caricamento dei file");
    } finally {
      setLoading(false);
    }
  };

  // CAMBIO ORDINAMENTO
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setDirection("asc");
    }
    fetchFiles(activeFilter);
  };

  const toggleStatus = async (id: number, newStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append("is_active", String(newStatus));

      await api.patch(`/api/v1/board/${id}/status`, formData);

      toast.success(newStatus ? "File riattivato" : "File disattivato");
      fetchFiles(activeFilter);
    } catch {
      toast.error("Errore durante l'aggiornamento dello stato");
    }
  };

  const openEditSitesModal = async (file: BoardFile) => {
    setEditFile(file);

    try {
      const res = await api.get("/api/v1/sites");
      setAllSites(res.data);

      const fileSites = await api.get(`/api/v1/board/${file.id}`);
      setSelectedSites(fileSites.data.sites || []);
    } catch {
      toast.error("Errore nel caricamento dei siti");
    }

    setShowEditSites(true);
  };

  const saveSites = async () => {
    if (!editFile) return;

    try