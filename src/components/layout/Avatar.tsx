import type { Member } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MemberAvatar({
  member,
  size = 32,
  ring = false,
}: {
  member: Member;
  size?: number;
  ring?: boolean;
}) {
  const initials = member.name.slice(0, 1).toUpperCase();
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br text-white font-semibold shadow-sm",
        member.color,
        ring && "ring-2 ring-white",
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={member.name}
    >
      {initials}
    </div>
  );
}

export function AvatarStack({
  members,
  max = 4,
  size = 28,
}: {
  members: Member[];
  max?: number;
  size?: number;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((m) => (
        <MemberAvatar key={m.id} member={m} size={size} ring />
      ))}
      {extra > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium ring-2 ring-white"
          style={{ width: size, height: size }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
