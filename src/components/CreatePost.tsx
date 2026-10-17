"use client"

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { createPost } from "@/action/post.action";
import { toast } from "react-hot-toast";
import ImageUpload from "./ImageUpload";

function CreatePost() {
    const {user} = useUser();
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() && !imageUrl) return;
        setIsPosting(true);

        try {
            const result = await createPost(content, imageUrl)

            if (result?.success) {
                setContent("");
                setImageUrl("");
                setShowImageUpload(false);

                toast.success("post created successfully")
            }
        } catch (error) {
            console.log("Error submitting post ", error);
            toast.error("Failed to create post")
        } finally {
            setIsPosting(false);
            
        }
    }  
  return (
    <div>
      <Card className="mb-5 overflow-hidden rounded-[16px] border-0 bg-[#f6f5f6] shadow-none">
        <CardContent className="p-4">
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <Avatar className="mt-1 size-8 shrink-0 ring-2 ring-white">
                      <AvatarImage src={user?.imageUrl} />
                    </Avatar>
                    <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 shadow-sm">
                      <Textarea 
                        placeholder="Share something with your community..."
                        className="min-h-[46px] resize-none border-none p-1 text-[12px] focus-visible:ring-0"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isPosting}
                      />
                    </div>
                </div>

            {(showImageUpload || imageUrl) && (

              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <ImageUpload 
                  endpoint="postImage"
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url);
                    if (!url) setShowImageUpload(false);
                  }}
                />
              </div>
            )}

                 <div className="flex items-center justify-between border-t border-slate-200/70 pt-3">
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-2 text-[11px] text-slate-500 hover:bg-white hover:text-violet-600"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="mr-1.5 size-4" />
                Photo
              </Button>
            </div>
            <Button
              className="h-8 rounded-full bg-slate-950 px-4 text-[11px] font-semibold hover:bg-slate-800"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreatePost
