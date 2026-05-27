async function searchLocal(query) {
    const res = await fetch(`http://localhost:5000/api/music/search?q=${query}`);
    return await res.json();
}
