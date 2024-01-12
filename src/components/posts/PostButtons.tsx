"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DatabaseUser, SessionUser } from "@/lib/userTypes";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { Link, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import Comments from "./Comments";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import LikeDialog from "./LikeDialog";
import { CommentPrivacyType } from "@/lib/postTypes";

interface postLike {
  postId: number;
  userId: string;
  user: DatabaseUser;
}

interface PostType {
  authorId: string;
  likes: postLike[];
  postId: number;
  author: string;
  privacy: "PUBLIC" | "FOLLOWERS" | "PRIVATE" | null;
  commentPrivacy: CommentPrivacyType
}

const PostButtons = ({
  postLiked,
  userId,
  user,
  post,
  singlePage,
  follows
}: {
  postLiked: boolean;
  userId: string;
  post: PostType;
  user: SessionUser;
  singlePage: boolean;
  follows: boolean
}) => {
  const { authorId, likes, postId, author } = post;
  const [liked, setLiked] = useState(postLiked);
  const [likeData, setLikeData] = useState<postLike[]>(likes);
  const [commentOpen, setCommentOpen] = useState(false);
  const [likeOpen, setLikeOpen] = useState(false);
  const utils = api.useUtils();

  const closeLikeDialog = useCallback(() => {
    setLikeOpen(false);
  }, []);

  const likeMutation = api.posts.likePost.useMutation({
    onMutate: () => {
      const previousLikeData = likeData;

      if (!liked) {
        const newLike: postLike = {
          postId,
          userId,
          user: {
            username: user.username,
          },
        };

        console.log(newLike);

        setLikeData((prevState) => [
          ...prevState,
          {
            ...newLike,
          },
        ]);
      } else {
        setLikeData((prevState) =>
          prevState.filter((like) => like.userId !== userId),
        );
      }

      setLiked((curr) => !curr);

      return {
        previousLikeData,
      };
    },
    onError(err, _, context) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setLiked(!liked);
      setLikeData(context!.previousLikeData);
    },
  });

  return (
    <div>
      {likeData.length > 0 ? (
        <div className="px-5 pb-2">
          <Dialog open={likeOpen} onOpenChange={setLikeOpen}>
            <DialogTrigger>
              <>
                {likeData.length === 1 ? (
                  <div className="flex items-center gap-2">
                    <div className="grid h-6 w-6 shrink-0 place-content-center rounded-full bg-gradient-to-br from-primary/50 to-primary text-white">
                      <ThumbsUp size="12" fill="white" className="" />
                    </div>

                    {likeData.map((like, i) => (
                      <h2 className="text-sm text-subtle" key={i}>
                        {like.user.username}
                      </h2>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="grid h-6 w-6 shrink-0 place-content-center rounded-full bg-gradient-to-br from-primary/50 to-primary text-white">
                      <ThumbsUp size="12" fill="white" className="" />
                    </div>

                    <h2 className="text-sm text-subtle">{likeData.length}</h2>
                  </div>
                )}
              </>
            </DialogTrigger>
            <DialogContent className="px-2 pr-4 pt-2">
              <LikeDialog
                postId={postId}
                likeLength={likeData.length}
                closeDialog={closeLikeDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
      <Separator />
      <div className="flex w-full p-1 text-sm">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100",
            { "text-primary": liked },
          )}
          onClick={async () => {
            await utils.notifications.countNotifications.invalidate()
            likeMutation.mutate({
              postId,
              userId,
              authorId,
              action: liked ? "UNLIKE" : "LIKE",
              username: user.username,
              image: user.image as string,
            });
          }}
        >
          <motion.div
            animate={
              liked ? { scale: [1, 1.15, 1], rotate: [0, 7, -7, 0] } : {}
            }
            className=""
          >
            <ThumbsUp size="16" fill={liked ? "#3066b2" : "transparent"} />
          </motion.div>
          <p className="text-xs sm:text-sm lg:text-base">Like</p>
        </button>
        <button
          className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100"
          onClick={() => {
            setCommentOpen(true);
          }}
        >
          <MessageCircle size="16" />
          <p className="text-xs sm:text-sm lg:text-base">Comment</p>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
              <Share2 size="16" />
              <p className="text-xs sm:text-sm lg:text-base">Share</p>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={20}>
            <DropdownMenuItem
              className="flex items-center gap-x-2 font-semibold"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_BASE_URL}${author}/${postId}`,
                );
              }}
            >
              <Link size={15} /> <p className="">Copy link</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      <Comments
      follows={follows}
        user={user}
        commentOpen={commentOpen}
        postId={postId}
        author={author}
        authorId={authorId}
        singlePage={singlePage}
        commentPrivacy={post.commentPrivacy}
      />
    </div>
  );
};

export default PostButtons;
