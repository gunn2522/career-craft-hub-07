import { useEffect, useState } from "react";
import { AmbassadorLayout } from "@/components/ambassador/AmbassadorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Image, FileText, Video, Upload } from "lucide-react";

interface MediaItem {
  id: string;
  event_id: string;
  media_type: string;
  file_url: string;
  file_name: string | null;
  description: string | null;
  created_at: string;
}

const AmbassadorMedia = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchMedia();
      fetchEvents();
    }
  }, [user]);

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from("ambassador_event_media")
      .select("*")
      .eq("ambassador_id", user!.id)
      .order("created_at", { ascending: false });
    if (!error) setMedia(data || []);
    setIsLoading(false);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("ambassador_events")
      .select("id, title")
      .eq("ambassador_id", user!.id)
      .order("created_at", { ascending: false });
    setEvents(data || []);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEvent) {
      toast.error("Please select an event first");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("ambassador-media")
      .upload(path, file);

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("ambassador-media")
      .getPublicUrl(path);

    const { error: dbError } = await supabase.from("ambassador_event_media").insert({
      event_id: selectedEvent,
      ambassador_id: user!.id,
      media_type: mediaType,
      file_url: urlData.publicUrl,
      file_name: file.name,
      description: description || null,
    });

    if (dbError) toast.error("Failed to save media record");
    else {
      toast.success("Media uploaded successfully");
      setDialogOpen(false);
      setDescription("");
      fetchMedia();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media?")) return;
    const { error } = await supabase.from("ambassador_event_media").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Media deleted");
      setMedia((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-8 w-8 text-primary" />;
      case "document": return <FileText className="h-8 w-8 text-accent" />;
      default: return <Image className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <AmbassadorLayout title="Event Media">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Upload post-event pictures, videos, and presentations</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Upload Media</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Event Media</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger><SelectValue placeholder="Select Event *" /></SelectTrigger>
                  <SelectContent>
                    {events.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={mediaType} onValueChange={setMediaType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">PPT / Document</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <label className="cursor-pointer text-primary hover:underline text-sm">
                    Choose file
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading || !selectedEvent} accept="image/*,video/*,.ppt,.pptx,.pdf" />
                  </label>
                  {uploading && <div className="mt-2"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></div>}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : media.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center py-12">
              <Image className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No media uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <Card key={item.id} className="glass-card overflow-hidden">
                {item.media_type === "image" ? (
                  <div className="aspect-video bg-muted">
                    <img src={item.file_url} alt={item.file_name || ""} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {getMediaIcon(item.media_type)}
                  </div>
                )}
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.file_name || "Untitled"}</p>
                      {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorMedia;
