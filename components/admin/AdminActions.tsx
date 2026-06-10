"use client";

import { useTransition } from "react";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";
import { deleteRestaurant, setRestaurantStatus } from "@/app/actions/admin";

export function ApproveRejectButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setRestaurantStatus(id, "approved");
          })
        }
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-white disabled:opacity-50"
        style={{ backgroundColor: "#15803D" }}
      >
        <IconCheck size={12} stroke={3} /> 승인
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setRestaurantStatus(id, "rejected");
          })
        }
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-white disabled:opacity-50"
        style={{ backgroundColor: "#B91C1C" }}
      >
        <IconX size={12} stroke={3} /> 거절
      </button>
    </div>
  );
}

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`"${name}" 식당을 삭제할까요? 되돌릴 수 없습니다.`))
          return;
        startTransition(async () => {
          await deleteRestaurant(id);
        });
      }}
      aria-label="삭제"
      className="rounded-lg border border-[#FFD4B8] bg-white p-1.5 text-[#B91C1C] disabled:opacity-50"
    >
      <IconTrash size={13} />
    </button>
  );
}
