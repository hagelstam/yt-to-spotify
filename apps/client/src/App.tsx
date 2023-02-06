import { saveAs } from "file-saver";
import { useState } from "react";

const App = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [image, setImage] = useState<File | null | undefined>(null);
  const [song, setSong] = useState<File | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <h1>Add Song Metadata</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          setIsLoading(true);

          const res = await fetch("http://localhost:8080/api/add-metadata", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              artist,
              title,
            }),
          });

          const { file_path } = (await res.json()) as { file_path: string };

          saveAs(file_path, "result.mp3");

          setIsLoading(false);
        }}
      >
        <div>
          <label htmlFor="song">Song</label>
          <input
            id="song"
            name="song"
            type="file"
            accept="audio/*"
            onChange={(e) => setSong(e.target.files?.item(0))}
            required
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
            required
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
    </>
  );
};

export default App;
