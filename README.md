`vrc-get`
====

[![GitHub deployments][shields-github-deploy]][release]
[![crates.io deployments][shields-crates-io-deploy]][crates-io]
[![Github latest][shields-github-version]][release]
[![crates.io latest][shields-crates-io-version]][crates-io]

Open Source command line client of VRChat Package Manager, 
the main feature of VRChat Creator Companion (VCC), that supports Windows, Linux, and macOS.

<small>This project is developed by community, not by VRChat.</small>

## Goals

### Initial goals

- Provide Open Source command line client of VRChat Package Manager.
- Provide more functionality for VPM than official vpm command.

### Additional goals since 2024
- Provide better cross-platform Creator Companion

## Commands

For more details, please see --help

- [x] `vrc-get install [pkg] [version]` (with alias `vrc-get i [pkg] [version]` and `vrc-get resolve`) 
  install package to your project
- [x] `vrc-get remove [pkg]` (with alias `vrc-get rm [pkg]`) remove package from your project
- [x] `vrc-get outdated` list outdated packages in your project
- [x] `vrc-get upgrade [pkg] [version]` upgrade package(s) in your project
- [x] `vrc-get search <query...>` search package in installed repositories in your PC
- [x] `vrc-get repo list` list installed repositories in your PC
- [x] `vrc-get repo add <url> [NAME]` add repository into your PC
- [x] `vrc-get repo remove <name or url>` remove repository from your PC
- [x] `vrc-get repo cleanup` cleanup repo cache
- [x] `vrc-get repo packages <NAME|url>` list packages in specified repository

# Installation

## Using homebrew

If you're using [Homebrew](https://brew.sh/), you can easily install vrc-get.

```
brew install vrc-get
```

## Using scoop

If you're using [scoop](https://scoop.sh/), you can install from a scoop bucket.

```
scoop bucket add xrtools "https://github.com/babo4d/scoop-xrtools"
scoop install vrc-get
```

## Using `cargo binstall`

If you have [`cargo binstall`][cargo-binstall], installing using cargo binstall is the easy & fast way to install vrc-get.
Cargo binstall will downloads & installs prebuilt vrc-get from GitHub.

```bash
cargo binstall vrc-get
```

## Using `cargo`

If you have [`cargo`][cargo], installing using cargo is an easy way to install vrc-get.

```bash
cargo install vrc-get
```

## Prebuilt binaries

There's prebuilt binaries on the [release] page.

Download executable file for your platform and place to everywhere you want.
There's no additional requirements for thise binaries. All binaries are compiled statically as possible.

For linux, it's a actually static linked executable.

For windows, only `bcrypt.dll`, `ntdll.dll`, `kernel32.dll`, `advapi32.dll`, `ws2_32.dll`, `secur32.dll`, 
and `crypt32.dll`, which is builtin dlls, are dynamically linked.

For macOS, only `Security.framework`, `CoreFoundation.framework`, `libiconv.2.dylibs`, and `libSystem.B.dylibs`, 
which are macOS-builtin dylibs, are dynamically linked.

## For GitHub Actions

To use this tool to resolve(install) vpm dependencies, you can use 
[`anatawa12/sh-actions/resolve-vpm-packages@master`][resolve-vpm-packages].

To use other commands, you can install `vpm-get` via [`anatawa12/sh-actions/setup-vrc-get@master`][setup-vrc-get].

For more details, please see README for each action.

[shields-github-deploy]: https://img.shields.io/github/deployments/anatawa12/vrc-get/master%20branch?label=github%20deployment
[shields-crates-io-deploy]: https://img.shields.io/github/deployments/anatawa12/vrc-get/crates.io?label=crates.io%20deployment
[shields-github-version]: https://img.shields.io/github/v/release/anatawa12/vrc-get
[shields-crates-io-version]: https://img.shields.io/crates/v/vrc-get

[cargo]: https://github.com/rust-lang/cargo/
[cargo-binstall]: https://github.com/cargo-bins/cargo-binstall#cargo-binaryinstall
[release]: https://github.com/anatawa12/vrc-get/releases/latest
[resolve-vpm-packages]: https://github.com/anatawa12/sh-actions/tree/master/resolve-vpm-packages
[setup-vrc-get]: https://github.com/anatawa12/sh-actions/tree/master/setup-vrc-get
[crates-io]: https://crates.io/crates/vrc-get
