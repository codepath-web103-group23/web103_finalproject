const styles = {
  search: {
    padding: "8px 12px",
    width: "250px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
  },
};

function SearchBar() {
  return (
    <input
      type="text"
      placeholder="Search..."
      style={styles.search}
    />
  );
}

export default SearchBar;
