import { useState } from "react";

const App = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [image, setImage] = useState<File | null | undefined>(null);
  const [song, setSong] = useState<File | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const uploadRes = await fetch("http://localhost:8080/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artist,
        title,
      }),
    });

    const { file_path } = (await uploadRes.json()) as { file_path: string };
    setDownloadLink(`http://localhost:8080${file_path}`);

    setIsLoading(false);
  };

  return (
    <>
      <h1>Add Song Metadata</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="song">Song</label>
          <input
            id="song"
            name="song"
            type="file"
            accept="audio/*"
            onChange={(e) => setSong(e.target.files?.item(0))}
          />
        </div>
        <div>
          <label htmlFor="cover">Cover</label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.item(0))}
          />
        </div>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="title">Artist</label>
          <input
            id="artist"
            name="artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      {image && <img alt="Album cover" height={200} src={URL.createObjectURL(image)} />}
      {song && (
        <audio controls>
          <source src={URL.createObjectURL(song)} />
          <track kind="captions" />
        </audio>
      )}

      {downloadLink.length > 0 && (
        <a href={downloadLink} target="_blank" rel="noreferrer">
          Download
        </a>
      )}
    </>
  );
};

export default App;
