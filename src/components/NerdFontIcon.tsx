interface NerdFontIconProps {
  glyph: string;
  className?: string;
}

const NerdFontIcon = ({ glyph, className = "text-2xl" }: NerdFontIconProps) => (
  <span
    className={`inline-flex items-center justify-center leading-none ${className}`}
    style={{ fontFamily: "'Symbols Nerd Font Mono', monospace" }}
  >
    {glyph}
  </span>
);

export default NerdFontIcon;

/** Curated Nerd Font glyphs for homelab dashboards */
export const NERD_FONT_GLYPHS: Record<string, { glyph: string; label: string }> = {
  // Linux distros
  "nf-linux":       { glyph: "\uF17C", label: "Linux (Tux)" },
  "nf-ubuntu":      { glyph: "\uF31B", label: "Ubuntu" },
  "nf-debian":      { glyph: "\uF306", label: "Debian" },
  "nf-arch":        { glyph: "\uF303", label: "Arch Linux" },
  "nf-fedora":      { glyph: "\uF30D", label: "Fedora" },
  "nf-nixos":       { glyph: "\uF313", label: "NixOS" },
  "nf-raspberrypi": { glyph: "\uF315", label: "Raspberry Pi" },
  "nf-centos":      { glyph: "\uF304", label: "CentOS" },

  // Dev / tools
  "nf-docker":      { glyph: String.fromCodePoint(0xF0868), label: "Docker" },
  "nf-git":         { glyph: "\uE702", label: "Git" },
  "nf-python":      { glyph: "\uE73C", label: "Python" },
  "nf-terminal":    { glyph: "\uE795", label: "Terminal" },
  "nf-code":        { glyph: "\uE796", label: "Code" },
  "nf-windows":     { glyph: "\uE70F", label: "Windows" },
  "nf-apple":       { glyph: "\uF179", label: "Apple" },

  // Infra / services
  "nf-server":      { glyph: "\uF233", label: "Server" },
  "nf-database":    { glyph: "\uF1C0", label: "Database" },
  "nf-cloud":       { glyph: "\uF0C2", label: "Cloud" },
  "nf-lock":        { glyph: "\uF023", label: "Lock" },
  "nf-folder":      { glyph: "\uF07B", label: "Folder" },
  "nf-download":    { glyph: "\uF019", label: "Download" },
  "nf-envelope":    { glyph: "\uF0E0", label: "Mail" },
  "nf-globe":       { glyph: "\uF0AC", label: "Globe" },
  "nf-shield":      { glyph: "\uF132", label: "Shield" },
  "nf-fire":        { glyph: "\uF06D", label: "Firewall" },
  "nf-wifi":        { glyph: "\uF1EB", label: "Wi-Fi" },
  "nf-disk":        { glyph: String.fromCodePoint(0xF048B), label: "Disk" },
  "nf-vpn":         { glyph: "\uF084", label: "VPN/Key" },
};
