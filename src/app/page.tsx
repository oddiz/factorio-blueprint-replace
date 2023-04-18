"use client";

import React, { ChangeEvent, useState } from "react";
import { deflate, inflate } from "pako";

interface Blueprint {
    blueprint: {
        icons: {
            signal: {
                type: string;
                name: string;
            };
            index: number;
        }[];
        entities: {
            entity_number: number;
            name: string;
            position: {
                x: number;
                y: number;
            };
            neighbours?: number[];
        }[];
        item: string;
        version: number;
    };
}

function findUniqueNames(obj: any, uniqueNames: Set<string>) {
    if (typeof obj !== "object" || obj === null) {
        return; // Return if obj is not an object or null
    }

    Object.keys(obj).forEach((key) => {
        if (key === "name") {
            uniqueNames.add(obj[key]); // Add name to set of unique names
        } else {
            findUniqueNames(obj[key], uniqueNames); // Recursively search for name key
        }
    });
}

function App() {
    const [inputValue, setInputValue] = useState(""),
        [jsonValue, setJsonValue] = useState(""),
        [searchValues, setSearchValues] = useState<Array<string>>([""]),
        [uniqueNames, setUniqueNames] = useState<Array<string>>([]),
        [replaceValues, setReplaceValues] = useState<Array<string>>([""]),
        [outputValue, setOutputValue] = useState(""),
        [isCopied, setIsCopied] = useState(false);

    function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
        const input = event.target.value;

        setInputValue(input);

        // Decode input string from base64 and inflate it
        try {
            const inflatedInput = inflate(Uint8Array.from(Buffer.from(input.slice(1), "base64")), { to: "string" }),
                json = JSON.parse(inflatedInput.toString()) as Blueprint;

            setJsonValue(JSON.stringify(json, null, 2));
            console.log(json);
            const uniqueNames = new Set<string>();

            findUniqueNames(json, uniqueNames);
            setUniqueNames([...uniqueNames]); // Extract all unique names
        } catch (error) {
            setJsonValue("Invalid input");
            console.log(error);
        }
    }

    function handleSearchChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
        const newValues = [...searchValues];

        newValues[index] = event.target.value;
        setSearchValues(newValues);
    }

    function handleReplaceChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
        const newValues = [...replaceValues];

        newValues[index] = event.target.value;
        setReplaceValues(newValues);
    }

    function handleAddRow() {
        setSearchValues([...searchValues, ""]);
        setReplaceValues([...replaceValues, ""]);
    }

    function handleOutputClick() {
        try {
            // Replace specified parts of JSON and deflate it
            let json = jsonValue;
            const searchRegexes = searchValues.map((value) => new RegExp(value, "g"));

            for (let i = 0; i < searchValues.length; i++) {
                if (searchRegexes[i] && replaceValues[i]) {
                    json = json.replace(searchRegexes[i], replaceValues[i]);
                }
            }

            const deflatedJson = deflate(json),
                // Encode deflated JSON with base64 and add '0' to the beginning
                encodedOutput = `0${Buffer.from(deflatedJson).toString("base64")}`;

            setOutputValue(encodedOutput);
        } catch (error) {
            setOutputValue("Invalid JSON");
            console.log(error);
        }
    }

    // Define Tailwind CSS classes for dark mode
    const darkModeClass = "bg-gray-900 text-white",
        darkModeInputClass = "bg-gray-800 text-white";

    return (
        <div className={`container my-12 mx-auto rounded-lg p-4 ${darkModeClass}`}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Factorio Blueprint Entity Replacer</h1>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col flex-1 w-0">
                    <label
                        htmlFor="input"
                        className="block mb-2"
                    >
                        Input:
                    </label>
                    <textarea
                        id="input"
                        rows={4}
                        className={`w-full p-2 rounded-lg bg-gray-200 focus:bg-gray-700 focus:outline-none ${darkModeInputClass}`}
                        value={inputValue}
                        onChange={handleInputChange}
                    ></textarea>
                    <div className="w-full py-1 my-4 flex-col">
                        <label
                            htmlFor="uniquenames"
                            className="block mb-2"
                        >
                            Unique Names:
                        </label>
                        <div className="flex-row flex-wrap">
                            {uniqueNames.map((name) => (
                                <button
                                    key={name}
                                    className="m-2 px-2 py-1 rounded-md bg-slate-600 hover:bg-slate-400"
                                    onClick={() => {
                                        setSearchValues([...searchValues, name]);
                                    }}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 ">
                        <div className="flex flex-col md:flex-col w-24 gap-4 mt-4 flex-1">
                            <div className="flex flex-1 flex-row gap-4">
                                <label
                                    htmlFor={`search`}
                                    className="block mb-2 w-44"
                                >
                                    Entity to Replace:
                                </label>
                                <label
                                    htmlFor={`replace`}
                                    className="block mb-2 w-44"
                                >
                                    Replace to:
                                </label>
                            </div>

                            {searchValues.map((value, index) => (
                                <div
                                    key={index}
                                    className="flex flex-1 flex-row gap-4"
                                >
                                    <div className="w-44">
                                        <input
                                            type="text"
                                            id={`search-${index}`}
                                            className={`w-full p-2 bg-gray-200 focus:outline-none ${darkModeInputClass}`}
                                            value={value}
                                            onChange={(event) => handleSearchChange(index, event)}
                                        />
                                    </div>
                                    <div className="w-44">
                                        <input
                                            type="text"
                                            id={`replace-${index}`}
                                            className={`w-full p-2 bg-gray-200  focus:outline-none ${darkModeInputClass}`}
                                            value={replaceValues[index]}
                                            onChange={(event) => handleReplaceChange(index, event)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div>
                                <button
                                    className="px-2 py-1 rounded-md bg-slate-600 hover:bg-slate-500"
                                    onClick={handleAddRow}
                                >
                                    Add Row
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-0">
                    <label
                        htmlFor="json"
                        className="block mb-2 "
                    >
                        JSON:
                    </label>
                    <pre
                        id="json"
                        className={`w-full h-96 p-2 bg-gray-200 overflow-auto ${darkModeClass}`}
                    >
                        {jsonValue}
                    </pre>
                </div>
            </div>

            <div className="mt-4">
                <button
                    className="px-2 py-1 rounded-md text-xl bg-green-800 hover:bg-green-600"
                    onClick={handleOutputClick}
                >
                    Convert
                </button>
            </div>
            <div className="mt-4">
                <label
                    htmlFor="output"
                    className="block mb-2"
                >
                    Output:
                </label>
                <textarea
                    id="output"
                    rows={4}
                    className={`w-full p-2 bg-gray-200 focus:bg-gray-800 focus:outline-none ${darkModeClass}`}
                    value={outputValue}
                    readOnly
                ></textarea>
                {outputValue && (
                    <button
                        className={`mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none ${darkModeClass}`}
                        onClick={() => {
                            navigator.clipboard.writeText(outputValue);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                        }}
                    >
                        {isCopied ? "Copied" : "Copy"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;

