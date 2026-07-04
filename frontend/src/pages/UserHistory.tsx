import { Box, Typography } from "@mui/material";

export default function UserHistory() {
  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Storico Utenti
      </Typography>

      <Typography>
        Questa pagina è in costruzione.  
        Qui verranno mostrati gli eventi storici legati ai dipendenti.
      </Typography>
    </Box>
  );
}
