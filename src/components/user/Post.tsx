import { Session } from "next-auth";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

const Post = ({ userData }: { userData: Session }) => {
  return (
    <section className="w-full">
      <div className="flex gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={userData.user.image as string}
            className="object-cover"
          />
          <AvatarFallback>
            <Skeleton className="h-full w-full rounded-full" />
          </AvatarFallback>
        </Avatar>
        <input
          type="text"
          placeholder="What's on your mind?"
          className="w-full border-none font-primary outline-none"
        />
      </div>
    </section>
  );
};

export default Post;
