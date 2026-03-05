import { useEffect, useState } from "react";
import { AmbassadorLayout } from "@/components/ambassador/AmbassadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Loader2, MessageSquare, Trash2, Send, Pin } from "lucide-react";
import { format } from "date-fns";

interface Discussion {
  id: string;
  title: string;
  content: string | null;
  is_pinned: boolean | null;
  reply_count: number | null;
  author_id: string;
  created_at: string;
  author_name?: string;
}

interface Reply {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author_name?: string;
}

const AmbassadorDiscussions = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (user) fetchDiscussions();
  }, [user]);

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from("ambassador_discussions")
      .select("*")
      .eq("ambassador_id", user!.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      const authorIds = [...new Set(data.map((d) => d.author_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds);
      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);
      setDiscussions(data.map((d) => ({ ...d, author_name: nameMap.get(d.author_id) || "Unknown" })));
    }
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const { error } = await supabase.from("ambassador_discussions").insert({
      ambassador_id: user!.id,
      author_id: user!.id,
      title,
      content: content || null,
    });
    if (error) toast.error("Failed to create discussion");
    else {
      toast.success("Discussion created");
      setTitle(""); setContent("");
      setDialogOpen(false);
      fetchDiscussions();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete discussion?")) return;
    const { error } = await supabase.from("ambassador_discussions").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Deleted");
      setDiscussions((prev) => prev.filter((d) => d.id !== id));
      if (selectedDiscussion?.id === id) setSelectedDiscussion(null);
    }
  };

  const openDiscussion = async (disc: Discussion) => {
    setSelectedDiscussion(disc);
    setLoadingReplies(true);
    const { data } = await supabase
      .from("ambassador_discussion_replies")
      .select("*")
      .eq("discussion_id", disc.id)
      .order("created_at", { ascending: true });

    if (data) {
      const authorIds = [...new Set(data.map((r) => r.author_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds);
      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);
      setReplies(data.map((r) => ({ ...r, author_name: nameMap.get(r.author_id) || "Unknown" })));
    }
    setLoadingReplies(false);
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedDiscussion) return;
    const { error } = await supabase.from("ambassador_discussion_replies").insert({
      discussion_id: selectedDiscussion.id,
      author_id: user!.id,
      content: replyText,
    });
    if (error) toast.error("Failed to reply");
    else {
      setReplyText("");
      openDiscussion(selectedDiscussion);
    }
  };

  const togglePin = async (disc: Discussion) => {
    const { error } = await supabase
      .from("ambassador_discussions")
      .update({ is_pinned: !disc.is_pinned })
      .eq("id", disc.id);
    if (!error) fetchDiscussions();
  };

  return (
    <AmbassadorLayout title="Discussions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Community forum for your campus cell</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Discussion</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Start a Discussion</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Topic Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
                <Button onClick={handleCreate} disabled={saving} className="w-full">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Post Discussion
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Discussion list */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : discussions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No discussions yet</p>
                </CardContent>
              </Card>
            ) : (
              discussions.map((disc) => (
                <Card
                  key={disc.id}
                  className={`glass-card cursor-pointer transition-colors hover:border-primary/50 ${selectedDiscussion?.id === disc.id ? "border-primary" : ""}`}
                  onClick={() => openDiscussion(disc)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {disc.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                          <h3 className="font-medium truncate">{disc.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {disc.author_name} · {format(new Date(disc.created_at), "MMM d")} · {disc.reply_count || 0} replies
                        </p>
                      </div>
                      {disc.author_id === user?.id && (
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); togglePin(disc); }}>
                            <Pin className={`h-3 w-3 ${disc.is_pinned ? "text-primary" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(disc.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Reply panel */}
          <div>
            {selectedDiscussion ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedDiscussion.title}</CardTitle>
                  {selectedDiscussion.content && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedDiscussion.content}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingReplies ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {replies.map((reply) => (
                        <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm">{reply.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {reply.author_name} · {format(new Date(reply.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      ))}
                      {replies.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">No replies yet</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    />
                    <Button size="icon" onClick={handleReply} disabled={!replyText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Select a discussion to view replies</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorDiscussions;
