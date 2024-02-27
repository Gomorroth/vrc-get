"use client"

import {
	Button,
	ButtonGroup,
	Card,
	IconButton,
	Menu,
	MenuHandler,
	MenuItem,
	MenuList,
	Spinner,
	Tooltip,
	Typography
} from "@material-tailwind/react";
import React, {useMemo, useState} from "react";
import {
	ArrowPathIcon,
	ChevronDownIcon,
	EllipsisHorizontalIcon,
	GlobeAltIcon,
	QuestionMarkCircleIcon,
	UserCircleIcon
} from "@heroicons/react/24/solid";
import {HNavBar, VStack} from "@/components/layout";
import {
	environmentAddProjectWithPicker,
	environmentProjects,
	TauriProject,
	TauriProjectType,
	utilOpen
} from "@/lib/bindings";
import {useQuery} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {SearchBox} from "@/components/SearchBox";
import {unsupported} from "@/lib/unsupported";
import {openUnity} from "@/lib/open-unity";
import {toast} from "react-toastify";

export default function Page() {
	const result = useQuery({
		queryKey: ["projects"],
		queryFn: environmentProjects,
	});

	const [search, setSearch] = useState("");

	return (
		<VStack className={"m-4"}>
			<ProjectViewHeader className={"flex-shrink-0"}
												 refresh={() => result.refetch()}
												 isLoading={result.isFetching}
												 search={search} setSearch={setSearch}/>
			<main className="flex-shrink overflow-hidden flex">
				<Card className="w-full overflow-x-auto overflow-y-scroll">
					{
						result.status == "pending" ? "Loading..." :
							result.status == "error" ? "Error Loading projects: " + result.error.message :
								<ProjectsTable projects={result.data} sorting={"lastModified"} search={search}/>
					}
				</Card>
			</main>
		</VStack>
	);
}

function ProjectsTable(
	{
		projects, sorting, search
	}: {
		projects: TauriProject[],
		sorting: "lastModified",
		search?: string
	}
) {
	const TABLE_HEAD = [
		"Name",
		"Type",
		"Unity",
		"Last Modified",
		"", // actions
	];

	const projectsShown = useMemo(() => {
		let searched = projects.filter(project => project.name.toLowerCase().includes(search?.toLowerCase() ?? ""));
		if (sorting === "lastModified") {
			searched.sort((a, b) => b.last_modified - a.last_modified);
		}
		return searched;
	}, [projects, sorting, search]);

	return (
		<table className="relative table-auto text-left">
			<thead>
			<tr>
				{TABLE_HEAD.map((head, index) => (
					<th key={index}
							className={`sticky top-0 z-10 border-b border-blue-gray-100 bg-blue-gray-50 p-2.5`}>
						<Typography variant="small" className="font-normal leading-none">{head}</Typography>
					</th>
				))}
			</tr>
			</thead>
			<tbody>
			{projectsShown.map((project) => <ProjectRow key={project.path} project={project}/>)}
			</tbody>
		</table>
	);
}

const ProjectDisplayType: Record<TauriProjectType, "Avatars" | "Worlds" | "Unknown"> = {
	"Unknown": "Unknown",
	"LegacySdk2": "Unknown",
	"LegacyWorlds": "Worlds",
	"LegacyAvatars": "Avatars",
	"UpmWorlds": "Worlds",
	"UpmAvatars": "Avatars",
	"UpmStarter": "Unknown",
	"Worlds": "Worlds",
	"Avatars": "Avatars",
	"VpmStarter": "Unknown",
}

const LegacyProjectTypes = ["LegacySdk2", "LegacyWorlds", "LegacyAvatars", "UpmWorlds", "UpmAvatars", "UpmStarter"];

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {style: 'short'});

function formatDateOffset(date: number) {
	const now = Date.now();
	const diff = now - date;

	const PER_SECOND = 1000;
	const PER_MINUTE = 60 * PER_SECOND;
	const PER_HOUR = 60 * PER_MINUTE;
	const PER_DAY = 24 * PER_HOUR;
	const PER_WEEK = 7 * PER_DAY;
	const PER_MONTH = 30 * PER_DAY;
	const PER_YEAR = 365 * PER_DAY;

	const diffAbs = Math.abs(diff);

	if (diffAbs < 1000) return "just now";
	if (diffAbs < PER_MINUTE) return relativeTimeFormat.format(Math.floor(diff / PER_SECOND), "second");
	if (diffAbs < PER_HOUR) return relativeTimeFormat.format(Math.floor(diff / PER_MINUTE), "minute");
	if (diffAbs < PER_DAY) return relativeTimeFormat.format(Math.floor(diff / PER_HOUR), "hour");
	if (diffAbs < PER_WEEK) return relativeTimeFormat.format(Math.floor(diff / PER_DAY), "day");
	if (diffAbs < PER_MONTH) return relativeTimeFormat.format(Math.floor(diff / PER_WEEK), "week");
	if (diffAbs < PER_YEAR) return relativeTimeFormat.format(Math.floor(diff / PER_MONTH), "month");

	return relativeTimeFormat.format(Math.floor(diff / PER_YEAR), "year");
}

function ProjectRow({project}: { project: TauriProject }) {
	const router = useRouter();

	const cellClass = "p-2.5";
	const noGrowCellClass = `${cellClass} w-1`;
	const typeIconClass = `w-5 h-5`;

	const displayType = ProjectDisplayType[project.project_type] ?? "Unknown"
	const isLegacy = LegacyProjectTypes.includes(project.project_type);
	const lastModified = new Date(project.last_modified);
	const lastModifiedHumanReadable = `${lastModified.getFullYear().toString().padStart(4, '0')}-${(lastModified.getMonth() + 1).toString().padStart(2, '0')}-${lastModified.getDate().toString().padStart(2, '0')} ${lastModified.getHours().toString().padStart(2, "0")}:${lastModified.getMinutes().toString().padStart(2, "0")}:${lastModified.getSeconds().toString().padStart(2, "0")}`;

	const openProjectFolder = () => utilOpen(project.path);

	return (
		<tr className="even:bg-blue-gray-50/50">
			<td className={cellClass}>
				<div className="flex flex-col">
					<Typography className="font-normal">
						{project.name}
					</Typography>
					<Typography className="font-normal opacity-50 text-sm">
						{project.path}
					</Typography>
				</div>
			</td>
			<td className={`${cellClass} w-[8em]`}>
				<div className="flex flex-row gap-2">
					<div className="flex items-center">
						{displayType === "Avatars" ? <UserCircleIcon className={typeIconClass}/> :
							displayType === "Worlds" ? <GlobeAltIcon className={typeIconClass}/> :
								<QuestionMarkCircleIcon className={typeIconClass}/>}
					</div>
					<div className="flex flex-col justify-center">
						<Typography className="font-normal">
							{displayType}
						</Typography>
						{isLegacy && <Typography className="font-normal opacity-50 text-sm text-red-700">Legacy</Typography>}
					</div>
				</div>
			</td>
			<td className={noGrowCellClass}>
				<Typography className="font-normal">
					{project.unity}
				</Typography>
			</td>
			<td className={noGrowCellClass}>
				<Tooltip content={lastModifiedHumanReadable}>
					<time dateTime={lastModified.toISOString()}>
						<Typography as={"time"} className="font-normal">
							{formatDateOffset(project.last_modified)}
						</Typography>
					</time>
				</Tooltip>
			</td>
			<td className={noGrowCellClass}>
				<div className="flex flex-row gap-2 max-w-min">
					<Button onClick={() => openUnity(project.path)}>Open Unity</Button>
					<Button onClick={() => router.push(`/projects/manage?${new URLSearchParams({projectPath: project.path})}`)}
									color={"blue"}>Manage</Button>
					<Button onClick={unsupported("Backup")} color={"green"}>Backup</Button>
					<Menu>
						<MenuHandler>
							<IconButton variant="text" color={"blue"}><EllipsisHorizontalIcon
								className={"size-5"}/></IconButton>
						</MenuHandler>
						<MenuList>
							<MenuItem onClick={openProjectFolder}>Open Project Folder</MenuItem>
						</MenuList>
					</Menu>
				</div>
			</td>
		</tr>
	)
}

function ProjectViewHeader({className, refresh, isLoading, search, setSearch}: {
	className?: string,
	refresh?: () => void,
	isLoading?: boolean,
	search: string,
	setSearch: (search: string) => void
}) {
	const addProject = async () => {
		try {
			const result = await environmentAddProjectWithPicker();
			switch (result) {
				case "NoFolderSelected":
					// no-op
					break;
				case "InvalidFolderAsAProject":
					toast.error("Invalid folder selected as a project");
					break;
				case "Successful":
					toast.success("Project added successfully");
					refresh?.();
					break;
				default:
					let _: never = result;
			}
		} catch (e) {
			console.error("Error adding project", e);
			toast.error((e as any).Unrecoverable ?? (e as any).message);
		}
	};

	return (
		<HNavBar className={className}>
			<Typography className="cursor-pointer py-1.5 font-bold flex-grow-0">
				Projects
			</Typography>

			<Tooltip content="Reflesh list of projects">
				<IconButton variant={"text"} onClick={() => refresh?.()} disabled={isLoading}>
					{isLoading ? <Spinner className="w-5 h-5"/> : <ArrowPathIcon className={"w-5 h-5"}/>}
				</IconButton>
			</Tooltip>

			<SearchBox className={"w-max flex-grow"} value={search} onChange={(e) => setSearch(e.target.value)}/>

			<Menu>
				<ButtonGroup>
					<Button className={"pl-4 pr-3"} onClick={unsupported("Create Project")}>Create New Project</Button>
					<MenuHandler className={"pl-2 pr-2"}>
						<Button>
							<ChevronDownIcon className={"w-4 h-4"}/>
						</Button>
					</MenuHandler>
				</ButtonGroup>
				<MenuList>
					<MenuItem onClick={addProject}>Add Existing Project</MenuItem>
				</MenuList>
			</Menu>
		</HNavBar>
	);
}