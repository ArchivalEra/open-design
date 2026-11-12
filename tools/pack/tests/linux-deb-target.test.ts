import { describe, expect, it } from "vitest";

import { resolveToolPackConfig } from "@/config/index.js";
import { assertLinuxInstallableArtifact, resolveLinuxBuilderTargets } from "@/linux.js";

describe("resolveLinuxBuilderTargets", () => {
  it("keeps AppImage as the default lane for all and explicit appimage", () => {
    expect(resolveLinuxBuilderTargets("all")).toEqual(["AppImage"]);
    expect(resolveLinuxBuilderTargets("appimage")).toEqual(["AppImage"]);
  });

  it("maps the deb target to electron-builder's deb target only", () => {
    expect(resolveLinuxBuilderTargets("deb")).toEqual(["deb"]);
  });

  it("maps dir to an unpacked build", () => {
    expect(resolveLinuxBuilderTargets("dir")).toEqual(["dir"]);
  });
});

describe("resolveToolPackConfig linux --to deb", () => {
  it("accepts deb and rejects targets from other platforms", () => {
    expect(resolveToolPackConfig("linux", { to: "deb" }).to).toBe("deb");
    expect(() => resolveToolPackConfig("linux", { to: "nsis" })).toThrow(/unsupported linux --to target: nsis/);
  });
});

describe("assertLinuxInstallableArtifact", () => {
  it("allows the AppImage lifecycle commands", () => {
    const config = resolveToolPackConfig("linux", { namespace: "deb-lifecycle", to: "appimage" });
    expect(() => assertLinuxInstallableArtifact(config, "install")).not.toThrow();
    expect(() => assertLinuxInstallableArtifact(config, "start")).not.toThrow();
  });

  it("refuses to install or start a deb through the AppImage lifecycle", () => {
    const config = resolveToolPackConfig("linux", { namespace: "deb-lifecycle", to: "deb" });
    expect(() => assertLinuxInstallableArtifact(config, "install")).toThrow(/does not support --to deb/);
    expect(() => assertLinuxInstallableArtifact(config, "start")).toThrow(/does not support --to deb/);
  });
});