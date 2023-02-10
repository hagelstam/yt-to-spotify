import { useState } from "react";

const App = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [cover, setCover] = useState<File | undefined | null>(undefined);
  const [downloadLink, setDownloadLink] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("url", url);
      formData.append("title", title);
      formData.append("artist", artist);
      if (cover) formData.append("cover", cover);

      const res = await fetch("http://localhost:8080/api/convert", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setErrorMessage(data.error);
      } else {
        setDownloadLink(data.file_path);
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>YouTube to Spotify Converter</h1>
      {isError && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="url">YouTube URL</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="artist">Artist</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            min={1}
            max={50}
          />
        </div>
        <div>
          <label htmlFor="title">Song title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            min={1}
            max={50}
          />
        </div>
        <div>
          <label htmlFor="cover">Album cover</label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.item(0))}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Convert"}
        </button>
      </form>
      {cover && (
        <img alt="Album cover" height={200} src={URL.createObjectURL(cover)} />
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
