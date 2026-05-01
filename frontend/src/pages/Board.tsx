const Board = () => {
  const [files, setFiles] = useState([]);
  const [sortBy, setSortBy] = useState("upload_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const fetchFiles = async () => {
    try {
      const response = await api.get(
        `/board?active=true&sort_by=${sortBy}&direction=${direction}`
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei file:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [sortBy, direction]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setDirection("asc");
    }
  };

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th onClick={() => handleSort("file_name")} className="sortable">
            Nome {sortBy === "file_name" && (direction === "asc" ? "▲" : "▼")}
          </th>

          <th onClick={() => handleSort("upload_date")} className="sortable">
            Data {sortBy === "upload_date" && (direction === "asc" ? "▲" : "▼")}
          </th>

          <th onClick={() => handleSort("author")} className="sortable">
            Autore {sortBy === "author" && (direction === "asc" ? "▲" : "▼")}
          </th>

          <th onClick={() => handleSort("sites")} className="sortable">
            Siti {sortBy === "sites" && (direction === "asc" ? "▲" : "▼")}
          </th>
        </tr>
      </thead>

      <tbody>
        {files.map((f: any) => (
          <tr key={f.id}>
            <td>{f.file_name}</td>
            <td>{new Date(f.upload_date).toLocaleString()}</td>
            <td>{f.hr_author_id}</td>
            <td>{f.sites.map((s: any) => s.name).join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
