import { useState, useEffect } from "react";
import { createFolder, getPublicFolders, getPrivateFolders, deleteFolder } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../components/ui/Select";

function Folders() {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const publicFolders = await getPublicFolders();
      const privateFolders = await getPrivateFolders();
      setFolders([...publicFolders.data, ...privateFolders.data]);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await createFolder({ name: newFolderName, public: isPublic });
      setNewFolderName("");
      setIsPublic(true);
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteFolder = async (id) => {
    try {
      await deleteFolder(id);
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <Card className="w-[400px] mx-auto mt-10 bg-notion-bg dark:bg-notion-dark">
      <CardHeader>
        <CardTitle className="text-notion-text dark:text-notion-text-dark">Folders</CardTitle>
        <CardDescription className="text-notion-text-light dark:text-notion-text-dark">Manage your folders</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name" className="text-notion-text dark:text-notion-text-dark">Folder Name</Label>
            <Input
              id="folder-name"
              type="text"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
              className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility" className="text-notion-text dark:text-notion-text-dark">Visibility</Label>
            <Select value={isPublic ? "public" : "private"} onValueChange={(value) => setIsPublic(value === "public")}>
              <SelectTrigger id="visibility" className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CardFooter>
            <Button type="submit" className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
              Create Folder
            </Button>
          </CardFooter>
        </form>

        <ul className="mt-4 space-y-2">
          {folders.map((folder) => (
            <li key={folder.id} className="flex justify-between items-center p-2 border border-notion-gray dark:border-notion-text-dark rounded-md">
              <div>
                <span className="font-semibold text-notion-text dark:text-notion-text-dark">{folder.name}</span>
                <span className="ml-2 text-xs text-notion-text-light dark:text-notion-text-dark">
                  ({folder.public ? "Public" : "Private"})
                </span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteFolder(folder.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default Folders;
