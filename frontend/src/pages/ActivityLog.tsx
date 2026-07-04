import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Card } from "@mui/material";
import api from "../services/api";

interface ActivityItem {
  id: number;
  action: string;
  created_at: string;
  employee_id: number;
}

export default function ActivityLog() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/v1/audit");
        setItems(res.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Log Attività
      </Typography>

      {items.length === 0 && (
        <Typography>Nessuna attività registrata.</Typography>
      )}

      {items.map((item) => (
        <Card key={item.id} sx={{ p: 2, mb: 2 }}>
          <Typography><strong>Azione:</strong> {item.action}</Typography>
          <Typography><strong>Dipendente:</strong> {item.employee_id}</Typography>
          <Typography><strong>Data:</strong> {item.created_at}</Typography>
        </Card>
      ))}
    </Box>
  );
}
