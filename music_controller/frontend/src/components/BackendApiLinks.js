/*
function splitLines(lines) {
  return lines.split(/\r?\n/g);
}
*/
const root = "/api/";

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEndpoints() {
  return new Promise((resolve, reject) => {
    fetch("/api/endpoints")
      .then((response) => {
        if (!response.ok) {
          reject({ Error: "Could not fetch the endpoints" });
        }
        return response.json();
      })
      .then((response) => {
        //console.log(response);
        let jsonFormat = "{";
        response.forEach((element, index, array) => {
          let item = element.split("-");
          item = item[0] + capitalizeFirstLetter(item[1]);
          jsonFormat +=
            '"' +
            item +
            '"' +
            ":" +
            '"' +
            root +
            element +
            '"' +
            (Object.is(array.length - 1, index) ? "" : ",");
        });
        jsonFormat += "}";
        //console.log(jsonFormat);
        resolve(JSON.parse(jsonFormat));
      });
  });
}

const endpoints = async () => {
  let endpoint = await getEndpoints();
  return endpoint;
};

export default endpoints;

// export const backendApiLinks = {
//   viewRooms: root + "view-rooms",
//   createRoom: root + "create-room",
//   getRoom: root + "get-room"
// };
