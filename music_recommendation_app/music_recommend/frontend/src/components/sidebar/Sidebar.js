import React from "react";
import { useToken } from "../TokenContext";
import {
  MusicalNoteIcon,
  ListBulletIcon,
  ViewColumnsIcon,
  MagnifyingGlassIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ changeView, currentView }) => {
  const { logout } = useToken();

  return (
    <div className="w-1/5 flex flex-col p-10 text-black bg-second  rounded-3xl mt-4 ml-4 mb-4 ">
      <SidebarItem
        icon={
          <MusicalNoteIcon
            className={` h-6 w-5 mr-4 ${
              currentView === "recommend" ? "text-third" : "text-black"
            }`}
          ></MusicalNoteIcon>
        }
        text={"Emotion-Based Music"}
        viewName={"recommend"}
        changeView={changeView}
        currentView={currentView}
      ></SidebarItem>
      <SidebarItem
        icon={
          <ListBulletIcon
            className={` h-6 w-5 mr-4 ${
              currentView === "preferences" ? "text-third" : "text-black"
            }`}
          ></ListBulletIcon>
        }
        text={"Music Preferences"}
        viewName={"preferences"}
        changeView={changeView}
        currentView={currentView}
      ></SidebarItem>
      <SidebarItem
        icon={
          <ViewColumnsIcon
            className={` h-6 w-5 mr-4 ${
              currentView === "playlists" ? "text-third" : "text-black"
            }`}
          ></ViewColumnsIcon>
        }
        text={"Playlists"}
        viewName={"playlists"}
        changeView={changeView}
        currentView={currentView}
      ></SidebarItem>
      <SidebarItem
        icon={
          <MagnifyingGlassIcon
            className={` h-6 w-5 mr-4 ${
              currentView === "search" ? "text-third" : "text-black"
            }`}
          ></MagnifyingGlassIcon>
        }
        text={"Search"}
        viewName={"search"}
        changeView={changeView}
        currentView={currentView}
      ></SidebarItem>
      <button className="flex mb-2 mt-auto" onClick={logout}>
        <ArrowLeftStartOnRectangleIcon className="text-black h-6 w-5 mr-4"></ArrowLeftStartOnRectangleIcon>
        <div className="">Logout</div>
      </button>
    </div>
  );
};

const SidebarItem = ({ icon, text, viewName, changeView, currentView }) => {
  return (
    <button className="flex mb-6" onClick={() => changeView(viewName)}>
      {icon}
      <div
        className={`${currentView === viewName ? "text-third" : "text-black"}`}
      >
        {text}
      </div>
    </button>
  );
};

export default Sidebar;
