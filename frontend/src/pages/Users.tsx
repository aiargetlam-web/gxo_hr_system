import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Menu, MenuItem, TableSortLabel, TablePagination,
  Chip, TextField, Box, Typography, Button
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";

import { userService } from "../services/userService";
import { siteService } from "../services/siteService";
import { User, Site } from "../types";
import { toast } from "react-hot-toast";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState("");

  // Sorting
  const [orderBy, setOrderBy] = useState<keyof User>("last_name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Menu ⋮
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modali
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeSiteModal, setShowChangeSiteModal] = useState(false);

  // Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [siteId, setSiteId] = useState<number | null>(null);
  const [idLul, setIdLul] = useState("");

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      toast.error("Errore caricamento utenti");
    }
  };

  const loadSites = async () => {
    try {
      const data = await siteService.getSites();
      setSites(data);
    } catch {
      toast.error("Errore caricamento siti");
    }
  };

  useEffect(() => {
    loadUsers();
    loadSites();
  }, []);

  // Sorting handler
  const handleSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedUsers = [...users]
    .filter((u) =>
      `${u.first_name} ${u.last_name} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[orderBy] ?? "").toString().toLowerCase();
      const valB = (b[orderBy] ?? "").toString().toLowerCase();
      return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  // Menu ⋮
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      await userService.resetPassword(selectedUser.id);
      toast.success("Password resettata");
    } catch {
      toast.error("Errore reset password");
    }
    closeMenu();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Gestione Utenti
      </Typography>

      {/* Barra superiore */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Cerca utente"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 250 }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
        >
          Crea nuovo utente
        </Button>
      </Box>

      {/* Tabella */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { id: "id_lul", label: "ID LUL" },
                  { id: "last_name", label: "Nome" },
                  { id: "email", label: "Email" },
                  { id: "site_id", label: "Sito" },
                  { id: "role", label: "Ruolo" },
                ].map((col) => (
                  <TableCell key={col.id}>
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={order}
                      onClick={() => handleSort(col.id as keyof User)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}

                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id_lul}</TableCell>
                    <TableCell>{u.first_name} {u.last_name}</TableCell>
                    <TableCell>{u.email}</TableCell>

                    <TableCell>
                      <Chip
                        label={sites.find((s) => s.id === u.site_id)?.name || "-"}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={u.role.toUpperCase()}
                        color={u.role === "admin" ? "error" : u.role === "hr" ? "warning" : "default"}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton onClick={(e) => openMenu(e, u)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={sortedUsers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      </Paper>

      {/* Menu ⋮ */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => { setShowEditModal(true); closeMenu(); }}>Modifica</MenuItem>
        <MenuItem onClick={() => { setShowChangeSiteModal(true); closeMenu(); }}>Cambia sito</MenuItem>
        <MenuItem onClick={handleResetPassword}>Reset password</MenuItem>
      </Menu>

      {/* Qui sotto restano i tuoi modali originali */}
      {/* (li mantengo identici per compatibilità con il backend) */}

      {/* ... I tuoi modali esistenti ... */}

    </Box>
  );
};

export default Users;
