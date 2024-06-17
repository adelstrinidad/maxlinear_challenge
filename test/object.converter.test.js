import { expect } from "chai";
import fs from "fs";

describe("Object converter/reverse", () => {
  it("Object converter", () => {
    const bench1 = {
      type: "bench",
      name: "bench1",
      id: 1,
      config: [
        {
          pdu1: {
            _id: 1,
            _type: "instrument",
          },
        },
        {
          pdu2: {
            _id: 2,
            _type: "instrument",
          },
        },
      ],
    };

    const instrument1 = {
      type: "instrument",
      name: "pdu1",
      id: 1,
      config: [
        {
          computer1: {
            _id: 1,
            _type: "computer",
          },
        },
        {
          device1: {
            _id: 1,
            _type: "device",
          },
        },
      ],
    };

    const instrument2 = {
      type: "instrument",
      name: "pdu2",
      id: 2,
      config: [
        {
          instrument1: {
            _id: 2,
            _type: "computer",
          },
        },
        {
          device2: {
            // I assumed there was an error here and I replaced pdu2 by device2
            _id: 2,
            _type: "device",
          },
        },
      ],
    };

    function benchConverter(benchObj, instrumentArray) {
      let newConfig = [];
      instrumentArray.forEach((instrument) => {
        newConfig.push({
          id: instrument.id,
          [instrument.name]: instrument.config,
        });
      });
      benchObj.config = newConfig;
      return benchObj;
    }

    const instruments = [instrument1, instrument2];
    const bench = benchConverter(bench1, instruments);

    fs.writeFileSync("outputs/output.json", JSON.stringify(bench, null, 2), "utf8");
  });

  it("Reverse object to get instruments", () => {
    const filePath = "outputs/output.json";
    let newBench;

    // Get new bench from json file
    try {
      const fileData = fs.readFileSync(filePath, "utf8");
      newBench = JSON.parse(fileData);
    } catch (error) {
      console.error(error);
      expect.fail("Error reading JSON file");
    }

    function regenarateInstruments(bench) {
      let regenarateInstruments = [];

      bench.config.forEach((item) => {
        const instrumentName = Object.keys(item).find((key) => key !== "id");
        const instrumentConfig = item[instrumentName];
        const instrumentId = item.id;

        // In case the instruments type can change, we would call the endpoint instruments/{item.id}
        // and take from the the reponse the instrument type and assign it to the "Type" property

        regenarateInstruments.push({
          type: "instrument",
          name: instrumentName,
          id: instrumentId,
          config: instrumentConfig,
        });
      });

      return regenarateInstruments;
    }

    const regenarateInstrument = regenarateInstruments(newBench);

    fs.writeFileSync(
      "outputs/regenarateInstruments.json",
      JSON.stringify(regenarateInstrument, null, 2),
      "utf8"
    );
  });
});
