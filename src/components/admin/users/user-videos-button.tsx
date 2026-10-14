"use client";

import { useState } from "react";
import { Video } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { UserVideosDialog } from "@/components/admin/users/user-videos-dialog";

interface UserVideosButtonProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  videoCount: number;
}

export function UserVideosButton({
  userId,
  userName,
  userEmail,
  videoCount,
}: UserVideosButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={videoCount === 0}
      >
        <Video className="h-4 w-4 mr-1" />
        查看视频
      </Button>
      <UserVideosDialog
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
