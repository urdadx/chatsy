interface SafeBoringAvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

export function SafeBoringAvatar({
  name,
  size = 40,
  className,
}: SafeBoringAvatarProps) {
  // Use DiceBear HTTP API for avatar
  const avatarUrl = name
    ? `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(name)}&size=${size}`
    : null;

  if (!name || !avatarUrl) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          backgroundColor: "#e5e7eb",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.round(size * 0.4),
          fontWeight: "bold",
          color: "#6b7280",
        }}
      >
        {name ? name.charAt(0).toUpperCase() : "?"}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-block",
        objectFit: "cover",
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
