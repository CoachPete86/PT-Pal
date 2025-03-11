{pkgs}: {
  deps = [
    pkgs.lsof
    pkgs.nodePackages.prettier
    pkgs.postgresql
  ];
}
