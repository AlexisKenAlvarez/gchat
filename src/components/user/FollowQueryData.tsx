"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { api } from "@/trpc/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Separator } from "../ui/separator";

const FollowQueryData = ({
  type,
  userId,
}: {
  type: "Following" | "Followers";
  userId: string;
}) => {
  const [ref, inView] = useInView();
  const { data, fetchNextPage, isFetching } =
    type === "Followers"
      ? api.user.getFollowers.useInfiniteQuery(
          {
            limit: 5,
            userId,
            type: "followers",
          },
          {
            getNextPageParam: (lastPage) => {
              return lastPage.nextCursor;
            },
          },
        )
      : api.user.getFollowers.useInfiniteQuery(
          {
            limit: 5,
            userId,
            type: "following",
          },
          {
            getNextPageParam: (lastPage) => {
              return lastPage.nextCursor;
            },
          },
        );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <DialogHeader className="space-y-3">
      <DialogTitle
        onClick={() => {
          fetchNextPage();
        }}
      >
        {type}
      </DialogTitle>
      <Separator />
      <div className="content max-h-[20rem] space-y-4 overflow-y-scroll text-left">
        {data?.pages.map((page, i) => (
          <div className="space-y-4" key={i}>
            {page.followers.map((follower, j) => (
              <Link
                href={`/${
                  type === "Followers"
                    ? follower.follower?.username
                    : follower.following?.username
                }`}
                key={follower?.id}
                ref={
                  data?.pages.length - 1 === i &&
                  page.followers.length - 1 === j
                    ? ref
                    : undefined
                }
              >
                <div className="flex gap-3 rounded-md px-4 py-3 transition-all duration-300 ease-in-out hover:bg-slate-100">
                  <Image
                    src={
                      type === "Followers"
                        ? (follower.follower?.image as string)
                        : (follower.following?.image as string)
                    }
                    alt={follower.follower?.name as string}
                    className="h-11 w-11 rounded-full object-cover"
                    width={500}
                    height={500}
                  />

                  <div className="flex flex-col justify-center">
                    <h1 className="max-w-[6rem] truncate font-primary font-bold md:max-w-[14rem]">
                      {type === "Followers"
                        ? follower.follower?.username
                        : follower.following?.username}
                    </h1>

                    <h2 className="max-w-[8rem] truncate font-primary text-sm md:max-w-[10rem]">
                      {type === "Followers"
                        ? follower.follower?.name
                        : follower.following?.name}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
        {/* {isFetching && (
          <div className="space-y-4">
            {[...new Array(4)].map((_, i) => (
              <UserSkeleton key={i} />
            ))}
          </div>
        )} */}
      </div>
    </DialogHeader>
  );
};

export default FollowQueryData;
