use crate::common::VirtualFileSystem;
use indexmap::IndexMap;
use serde_json::json;
use vrc_get_vpm::unity_project::pending_project_changes::Remove;
use vrc_get_vpm::version::{Version, VersionRange};
use vrc_get_vpm::{PackageJson, UnityProject};

pub struct VirtualProjectBuilder {
    dependencies: IndexMap<String, Version>,
    locked: IndexMap<String, (Version, IndexMap<String, VersionRange>)>,
    installed_package_jsons: IndexMap<String, String>,
}

impl VirtualProjectBuilder {
    pub fn new() -> Self {
        Self {
            dependencies: IndexMap::new(),
            locked: IndexMap::new(),
            installed_package_jsons: IndexMap::new(),
        }
    }

    pub fn add_dependency(&mut self, name: &str, version: Version) -> &mut VirtualProjectBuilder {
        self.dependencies.insert(name.into(), version);
        self
    }

    pub fn add_locked(
        &mut self,
        name: &str,
        version: Version,
        dependencies: &[(&str, &str)],
    ) -> &mut VirtualProjectBuilder {
        let dependencies = dependencies
            .iter()
            .map(|(name, version)| (name.to_string(), version.parse().unwrap()))
            .collect();
        self.locked.insert(name.into(), (version, dependencies));
        self
    }

    pub fn add_package_json(
        &mut self,
        name: &str,
        package_json: impl Into<String>,
    ) -> &mut VirtualProjectBuilder {
        self.installed_package_jsons
            .insert(name.into(), package_json.into());
        self
    }

    pub async fn build(&self) -> std::io::Result<UnityProject<VirtualFileSystem>> {
        let vpm_manifest = {
            let mut dependencies = serde_json::Map::new();
            for (dependency, version) in &self.dependencies {
                dependencies.insert(
                    dependency.to_string(),
                    json!({ "version": version.to_string() }),
                );
            }

            let mut locked = serde_json::Map::new();
            for (name, (version, dependencies)) in &self.locked {
                let mut locked_dependencies = serde_json::Map::new();
                for (dependency, range) in dependencies {
                    locked_dependencies.insert(dependency.to_string(), json!(range.to_string()));
                }
                locked.insert(
                    name.to_string(),
                    json!({
                        "version": version.to_string(),
                        "dependencies": locked_dependencies,
                    }),
                );
            }

            json!({
                "dependencies": dependencies,
                "locked": locked,
            })
        };

        let fs = VirtualFileSystem::new();
        fs.add_file(
            "Packages/vpm-manifest.json".as_ref(),
            vpm_manifest.to_string().as_bytes(),
        )
        .await?;

        for (name, package_json) in &self.installed_package_jsons {
            fs.add_file(
                format!("Packages/{}/package.json", name).as_ref(),
                package_json.as_bytes(),
            )
            .await?;
        }

        UnityProject::load(fs).await
    }
}
