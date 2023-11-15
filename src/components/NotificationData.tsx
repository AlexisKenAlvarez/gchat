"use client";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dispatch,
  SetStateAction,
  UIEvent,
  useEffect,
  useRef
} from "react";
import UserSkeleton from "./skeleton/UserSkeleton";
import { SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

const NotificationData = ({
  userId,
  setOpen,
  open,
}: {
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const read = api.notifications.readNotifications.useMutation();
  const { data, fetchNextPage, isFetching } =
    api.notifications.getNotifications.useInfiniteQuery(
      {
        limit: 10,
        userId,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
        refetchOnMount: true,
      },
    );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    const scrollPercentage =
      (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;

    if (scrollPercentage > 75) {
      console.log("Fetching next page");
      fetchNextPage();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const hasVerticalScrollbar = sheetRef.current
        ? sheetRef.current.scrollHeight > sheetRef.current.clientHeight
        : false;

      if (open && !hasVerticalScrollbar) {
        fetchNextPage();
      }
    }, 200);
  }, [open]);

  return (
    <SheetContent
      className="overflow-y-scroll p-0 px-2 pb-5 text-left"
      onScroll={handleScroll}
      ref={sheetRef}
    >
      <SheetHeader>
        <SheetTitle className="m-5 text-left">Notifications</SheetTitle>
        <Separator />
        <div className="mt-2">
          {data?.pages.map((page, i) => (
            <div className="" key={i}>
              {page.notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={
                    notif.type === "FOLLOW"
                      ? `/${notif.notificationFrom.username}`
                      : ""
                  }
                  onClick={async() => {
                    setOpen(false)
                    await read.mutateAsync({
                      notificationId: notif.id
                    })
                  }}
                >
                  <div className="relative rounded-md px-5 py-3 text-left transition-all duration-300 ease-in-out hover:bg-gchat/5">
                    {notif.status === "UNREAD" && (
                      <div className="absolute bottom-0 right-4 top-0 my-auto h-2 w-2 rounded-full bg-gchat"></div>
                    )}

                    <div className=" flex items-center gap-3">
                      <div className="relative h-fit w-fit rounded-full">
                        <div className="absolute bottom-[-4px] right-[-4px] h-fit w-fit rounded-full bg-gchat p-[5px]">
                          <User fill="white" stroke="white" size={13} />
                        </div>
                        <Image
                          src={notif.notificationFrom.image ?? "/fox.webp"}
                          alt={notif.notificationFrom.username ?? "User Image"}
                          className="ml-0 w-12 shrink-0 rounded-full"
                          width={500}
                          height={500}
                        />
                      </div>

                      <div className="flex flex-col justify-center gap-0">
                        <h1 className=" max-w-20 inline-block truncate overflow-ellipsis font-primary font-bold md:max-w-[14rem]">
                          {notif.notificationFrom.username}
                        </h1>
                        <p className="-mt-[5px]">is now following you.</p>
                        <p className="-mt-[2px] font-primary text-xs font-semibold text-gchat">
                          {timeAgo(notif.createdAt.toString())}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}

          {isFetching &&
            [...new Array(4)].map((_, i) => (
              <div className="px-5 py-3" key={i}>
                <UserSkeleton imageSize="12" />
              </div>
            ))}
        </div>
      </SheetHeader>
    </SheetContent>
  );
};

export default NotificationData;
