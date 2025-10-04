import Header from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, Download, VideoIcon, Music, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DownloadedItem {
  id: string;
  title: string;
  poster: string;
  size: string;
  quality: string;
}

export default function DownloadPage() {
  const [downloads] = useState<DownloadedItem[]>([
    {
      id: "1",
      title: "Spider-Man: No Way Home",
      poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
      size: "2.5 GB",
      quality: "1080p",
    },
  ]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DownloadedItem | null>(null);

  const handleDelete = (item: DownloadedItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Downloads</h1>

        {/* Settings */}
        <div className="space-y-3">
          <SettingItem icon={Wifi} label="Wi-Fi Only" />
          <SettingItem icon={Download} label="Smart Downloads" />
          <SettingItem icon={VideoIcon} label="Video Quality" value="1080p" />
          <SettingItem icon={Music} label="Audio Quality" value="High" />
          <Button
            variant="destructive"
            className="w-full h-14 text-base font-semibold"
          >
            Delete All Downloads
          </Button>
        </div>

        {/* Downloaded Items */}
        <div className="space-y-4 mt-8">
          {downloads.length === 0 ? (
            <div className="text-center py-12">
              <Download className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Downloads Yet</h3>
              <p className="text-muted-foreground">
                Download movies to watch offline
              </p>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-card rounded-lg p-3"
              >
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{item.quality}</Badge>
                    <Badge variant="outline">{item.size}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Download</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SettingItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <span className="font-medium">{label}</span>
      </div>
      {value && <span className="text-muted-foreground">{value}</span>}
    </div>
  );
}
