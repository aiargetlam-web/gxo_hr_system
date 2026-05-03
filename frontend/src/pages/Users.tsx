import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";

import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import { siteService } from "../services/siteService";

import { User, Role, Site } from "../types";

import UserCreateModal from "../components/users/UserCreateModal";
import UserEditModal from "../components/users/UserEditModal";
import UserChangeSiteModal from "../components/users/UserChangeSiteModal";
import UserImportCsvModal from "../components/users/UserImportCsvModal";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<User | null>(null);
  const [openChangeSite, setOpenChangeSite] = useState<User | null>(null);
  const [openImport, setOpenImport] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, r, s] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles(),
        siteService.getSites(),
      ]);
      setUsers(u);
      setRoles(r);
      setSites(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: User) => {
    await userService.toggleStatus(user.id, !user.is_active);
    loadData();
  };

  const handleResetPassword = async (user: User) => {
    await userService.resetPassword(user.id);
    loadData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(s) ||
      u.last_name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.id_lul || "").toLowerCase().includes(s)
    );
  });

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight={700}>
          Gestione Utenti
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenImport(true)}
          >
            Importa CSV
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => alert("TODO: export CSV")}
          >
            Esporta CSV
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Nuovo Utente
          </Button>
        </Stack>
      </Stack>

      {/* FILTRI */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Cerca"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Stack>
      </Card>

      {/* TABELLA */}
      <Card>
        <Box p={2}>
          {/* HEADER TABELLA */}
          <Stack direction="row" sx={{ fontWeight: 600, mb: 1 }}>
            <Box flex={1}>Nome</Box>
            <Box flex={1}>Email</Box>
            <Box flex={1}>Ruolo</Box>
            <Box flex={1}>Sito</Box>
            <Box flex={1}>ID LUL</Box>
            <Box width={120}>Stato</Box>
            <Box width={50}></Box>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* RIGHE */}
          {filteredUsers.map((u) => (
            <Stack
              key={u.id}
              direction="row"
              alignItems="center"
              sx={{
                py: 1.5,
                borderBottom: "1px solid #eee",
              }}
            >
              <Box flex={1}>
                {u.first_name} {u.last_name}
              </Box>

              <Box flex={1}>{u.email}</Box>

              <Box flex={1}>
                <Chip
                  label={u.role?.name?.toUpperCase() || "-"}
                  color={
                    u.role?.name === "admin"
                      ? "secondary"
                      : u.role?.name === "hr"
                      ? "primary"
                      : "default"
                  }
                />
              </Box>

              <Box flex={1}>{u.site?.name || "-"}</Box>

              <Box flex={1}>{u.id_lul || "-"}</Box>

              <Box width={120}>
                <Chip
                  label={u.is_active ? "Attivo" : "Disattivo"}
                  color={u.is_active ? "primary" : "default"}
                />
              </Box>

              <Box width={50} textAlign="right">
                <IconButton onClick={(e) => handleMenuOpen(e, u)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Stack>
          ))}
        </Box>
      </Card>

      {/* MENU ⋮ */}
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setOpenEdit(selectedUser);
            handleMenuClose();
          }}
        >
          Modifica
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenChangeSite(selectedUser);
            handleMenuClose();
          }}
        >
          Cambia Sito
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleToggleStatus(selectedUser!);
            handleMenuClose();
          }}
        >
          {selectedUser?.is_active ? "Disattiva" : "Attiva"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleResetPassword(selectedUser!);
            handleMenuClose();
          }}
        >
          Reset Password
        </MenuItem>
      </Menu>

      {/* MODALI */}
      <UserCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadData}
        roles={roles}
        sites={sites}
      />

      <UserEditModal
        open={!!openEdit}
        onClose={() => setOpenEdit(null)}
        user={openEdit}
        onUpdated={loadData}
        roles={roles}
        sites={sites}
      />

      <UserChangeSiteModal
        open={!!openChangeSite}
        onClose={() => setOpenChangeSite(null)}
        user={openChangeSite}
        onUpdated={loadData}
        sites={sites}
      />

      <UserImportCsvModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        onImported={loadData}
      />
    </Box>
  );
}
