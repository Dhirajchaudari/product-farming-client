type UserAvatarSize = "sm" | "md" | "lg";

interface UserAvatarProps {
  size?: UserAvatarSize;
  className?: string;
  title?: string;
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const sizeClass: Record<UserAvatarSize, string> = {
  sm: "userAvatarIcon userAvatarIconSm",
  md: "userAvatarIcon userAvatarIconMd",
  lg: "userAvatarIcon userAvatarIconLg",
};

export function UserAvatar({ size = "md", className = "", title }: UserAvatarProps) {
  return (
    <div
      className={`${sizeClass[size]} ${className}`.trim()}
      title={title}
      role="img"
      aria-label={title ?? "User profile"}
    >
      <UserIcon />
    </div>
  );
}
