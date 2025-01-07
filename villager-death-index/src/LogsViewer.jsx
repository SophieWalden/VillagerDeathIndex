import React, { useState, useEffect } from "react";

const cordinates = {"Maiden": [-1815, 86, -646], "Aden": [-1431, 102, -800], "Gimon": [-1281, 185, -1311]}

const calculateDistance = (coord1, coord2) => {
  return Math.sqrt(
    Math.pow(coord1.x - coord2[0], 2) +
    Math.pow(coord1.y - coord2[1], 2) +
    Math.pow(coord1.z - coord2[2], 2)
  );
};


const LogViewer = () => {
  const [villagerDeaths, setVillagerDeaths] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortBy, setSortBy] = useState("name"); 
  const [filterType, setFilterType] = useState("all"); 
  const [selectedBase, setSelectedBase] = useState("all");

  useEffect(() => {
    fetch("/VillagerDeathIndex/logs-manifest.json")
      .then((response) => response.json())
      .then((data) => {
      
        const logFiles = data.logs.filter((file) => file.endsWith(".log"));

        logFiles.forEach((file) => {
          console.log(file);
          fetch(`/VillagerDeathIndex/logs/${file}/${file}`)
            .then((response) => response.text()) 
            .then((data) => {

              const deathMessages = extractVillagerDeaths(data);
              setVillagerDeaths((prevDeaths) => [...prevDeaths, ...deathMessages]);
            })
            .catch((error) => {
              console.error("Error fetching log:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching logs manifest", error);
      });
  }, []);

  const assignBase = (death) => {
    const radius = 400; 
    let closestBase = null;
    let closestDistance = Infinity;


    for (const [baseName, baseCoords] of Object.entries(cordinates)) {
      const distance = calculateDistance(death.coordinates, baseCoords);
      if (distance <= radius) {
        if (distance < closestDistance) {
          closestBase = baseName; 
          closestDistance = distance;
        }
      }
    }

    return closestBase ? closestBase : "Random Death";
  };
  
  const extractVillagerDeaths = (logContent) => {
    const deathMessages = [];
    const lines = logContent.split("\n");
  
    const villagerDeathRegex =
      /'([^']+)'\/\d+.*x=([-\d.]+),\sy=([-\d.]+),\sz=([-\d.]+).*died,\smessage:\s'([^']+)'/;
  
    lines.forEach((line) => {
      const match = line.match(villagerDeathRegex);
  
      if (match) {
        const [, name, x, y, z, message] = match;
        const coordinates = { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) };
        const base = assignBase({ coordinates });
  
        deathMessages.push({
          name: name.trim(),
          coordinates,
          message,
          base,
        });
      }
    });
  
    return deathMessages;
  };

  const getSortedDeaths = (deaths) => {
    let sortedDeaths = [...deaths];
  
    if (sortBy === "name") {
      sortedDeaths.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "message") {
      sortedDeaths.sort((a, b) => a.message.localeCompare(b.message));
    } else if (sortBy === "coordinates") {
      sortedDeaths.sort((a, b) => {
        const aCoords = `${a.coordinates.x},${a.coordinates.y},${a.coordinates.z}`;
        const bCoords = `${b.coordinates.x},${b.coordinates.y},${b.coordinates.z}`;
        return aCoords.localeCompare(bCoords);
      });
    }
  
    return sortedDeaths;
  };


  const getFilteredDeaths = (deaths) => {
    let filteredDeaths = deaths;
  

    if (filterType === "named") {
      filteredDeaths = filteredDeaths.filter(
        (death) => death.name && death.name !== "Villager" && !isBaseVillagerType(death.name)
      );
    } else if (filterType === "unnamed") {
      filteredDeaths = filteredDeaths.filter(
        (death) => !death.name || (death.name === "Villager" || isBaseVillagerType(death.name))
      );
    }
  

    if (selectedBase !== "all") {
      filteredDeaths = filteredDeaths.filter((death) => death.base === selectedBase);
    }
  
    return filteredDeaths;
  };
  

  const isBaseVillagerType = (name) => {
    const baseTypes = [
      "Butcher",
      "Cartographer",
      "Farmer",
      "Fletcher",
      "Librarian",
      "Armorer",
      "Weaponsmith",
      "Cleric",
      "Mason",
      "Leatherworker",
      "Shepherd",
      "Toolsmith"
    ];
    return baseTypes.includes(name);
  };

  const sortedAndFilteredDeaths = getSortedDeaths(getFilteredDeaths(villagerDeaths));

  return (
    <div className="log-viewer-container">


      {/* Filter and Sort Controls */}
      <div className="controls">
      <div className="filter-controls filterTest">
          <label htmlFor="filter">Filter By:</label>
          <select
          className="filter-test"
            id="filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Villagers</option>
            <option value="named">Named Villagers</option>
            <option value="unnamed">Unnamed Villagers</option>
          </select>
        </div>

        <div className="base-filter-controls filterTest">
          <label htmlFor="baseFilter">Filter By Base:</label>
          <select
          className="filter-test"
            id="baseFilter"
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
          >
            <option value="all">All Bases</option>
            {Object.keys(cordinates).map((base) => (
              <option key={base} value={base}>
                {base}
              </option>
            ))}
            <option value="Random Death">Random Death</option>
          </select>
        </div>
      </div>

      <div className="death-list">
        {sortedAndFilteredDeaths.length === 0 ? (
          <p>No villager deaths found.</p>
        ) : (
          sortedAndFilteredDeaths.map((death, index) => (
            <div className="death-item" key={index}>
  <h3 className="death-name">{death.name}</h3>
  <p className="death-coordinates">
    Coordinates: {death.coordinates.x}, {death.coordinates.y}, {death.coordinates.z}
  </p>
  <p className="death-message">Death Message: {death.message}</p>
  <p
  className="death-base"
  style={{
    color:
      death.base === "Maiden"
        ? "red"
        : death.base === "Aden"
        ? "green"
        : death.base === "Gimon"
        ? "blue"
        : "#5a5a5a", 
  }}
>
  Assigned Base: {death.base}
</p>
</div>

          ))
        )}
      </div>
    </div>
  );
};

export default LogViewer;
