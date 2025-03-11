{pkgs}: {
  deps = [
    pkgs.run
    pkgs.lsof
    pkgs.nodePackages.prettier
    pkgs.postgresql
  ];
}
