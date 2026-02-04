"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2Icon } from "lucide-react"
import { log } from "console"
import toast from "react-hot-toast"
import { toogleFollow } from "@/action/user.action"

function FollowButton({userId}: {userId:string}) {

    const  [isLoading, setIsLoading] = useState(false)

    const handleFollow = async () => {
        setIsLoading(true)

        try {
            await toogleFollow(userId)
            toast.success("User followed succesfully")
        } catch (error) {
            toast.error("Error following user")
        }
    }
  return (
    <Button
    size={"sm"}
    variant={"secondary"}
    onClick={handleFollow}
    disabled={isLoading}
    className="w-20"
    >
      {isLoading? <Loader2Icon className="size-4 animate-spin"/> : "follow"}
    </Button>
  )
}

export default FollowButton
