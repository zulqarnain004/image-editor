import React, { useState, useRef } from "react";
import "./components/style/main.scss";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";
import { CgMergeVertical, CgMergeHorizontal } from "react-icons/cg";
import { IoMdUndo, IoMdRedo, IoIosImage } from "react-icons/io";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const App = () => {
  const filterElement = [
    {
      name: "brightness",
    },
    {
      name: "grayscale",
    },
    {
      name: "sepia",
    },
    {
      name: "saturate",
    },
    {
      name: "contrast",
    },
    {
      name: "hueRotate",
    },
  ];

  const initialState = {
    image: "",
    brightness: 100,
    grayscale: 0,
    sepia: 0,
    saturate: 100,
    contrast: 100,
    hueRotate: 0,
    rotate: 0,
    vertical: 1,
    horizontal: 1,
  };

  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isCropping, setIsCropping] = useState(false); // New state to manage cropping mode
  const cropperRef = useRef(null);

  const imageHandler = (e) => {
    if (e.target.files.length !== 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const newState = {
          ...state,
          image: reader.result,
        };
        updateState(newState);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const updateState = (newState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setState(newState);
  };

  const handleFilterChange = (e, filterName) => {
    const newState = {
      ...state,
      [filterName]: e.target.value,
    };
    updateState(newState);
  };

  const handleRotateLeft = () => {
    const newState = {
      ...state,
      rotate: state.rotate - 90,
    };
    updateState(newState);
  };

  const handleRotateRight = () => {
    const newState = {
      ...state,
      rotate: state.rotate + 90,
    };
    updateState(newState);
  };

  const handleFlipVertical = () => {
    const newState = {
      ...state,
      vertical: state.vertical === 1 ? -1 : 1,
    };
    updateState(newState);
  };

  const handleFlipHorizontal = () => {
    const newState = {
      ...state,
      horizontal: state.horizontal === 1 ? -1 : 1,
    };
    updateState(newState);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setState(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setState(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const resetHandler = () => {
    updateState(initialState);
  };

  const startCropImage = () => {
    setIsCropping(true); // Set cropping mode to true
  };

  const cropImage = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const croppedImage = cropperRef.current.cropper.getCroppedCanvas().toDataURL();
      updateState({
        ...state,
        image: croppedImage,
      });
      setIsCropping(false); // Exit cropping mode
    }
  };

  const saveImage = () => {
    const link = document.createElement("a");
    link.href = state.image;
    link.download = "edited-image.png";
    link.click();
  };

  return (
    <div className="image_editor">
      <div className="card">
        <div className="card_header">
          <h2>------ Image Editor ------</h2>
        </div>
        <div className="card_body">
          <div className="sidebar">
            <div className="sidebody">
              <div className="filter_section">
                <span>Filters</span>
                <div className="filter_key">
                  {filterElement.map((v, i) => (
                    <div key={i} className="filter_slider">
                      <div className="label_bar">
                        <label htmlFor={v.name}>{v.name}</label>
                        <span>{state[v.name]}%</span>
                      </div>
                      <input
                        type="range"
                        id={v.name}
                        min="0"
                        max={v.name === "hueRotate" ? "360" : "200"}
                        value={state[v.name]}
                        onChange={(e) => handleFilterChange(e, v.name)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rotate">
                <label>Rotate & Flip</label>
                <div className="icon">
                  <div onClick={handleRotateLeft}>
                    <GrRotateLeft />
                  </div>
                  <div onClick={handleRotateRight}>
                    <GrRotateRight />
                  </div>
                  <div onClick={handleFlipVertical}>
                    <CgMergeVertical />
                  </div>
                  <div onClick={handleFlipHorizontal}>
                    <CgMergeHorizontal />
                  </div>
                </div>
              </div>
            </div>
            <div className="reset">
              <button onClick={resetHandler}>Reset</button>
              <button className="save" onClick={saveImage}>
                Save Image
              </button>
            </div>
          </div>
          <div className="image_section">
            <div className="image">
              {state.image ? (
                isCropping ? (
                  <Cropper
                    src={state.image}
                    style={{
                      maxWidth: "100%",  // Limit Cropper width
                      maxHeight: "100%", // Limit Cropper height
                      filter: `
                        brightness(${state.brightness}%) 
                        contrast(${state.contrast}%) 
                        grayscale(${state.grayscale}%) 
                        saturate(${state.saturate}%) 
                        sepia(${state.sepia}%) 
                        hue-rotate(${state.hueRotate}deg)
                      `,
                      transform: `
                        rotate(${state.rotate}deg)
                        scale(${state.horizontal}, ${state.vertical})
                      `,
                    }}
                    aspectRatio={1}
                    guides={false}
                    ref={cropperRef}
                  />
                ) : (
                  <img
                    src={state.image}
                    alt="Edited"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      filter: `
                        brightness(${state.brightness}%) 
                        contrast(${state.contrast}%) 
                        grayscale(${state.grayscale}%) 
                        saturate(${state.saturate}%) 
                        sepia(${state.sepia}%) 
                        hue-rotate(${state.hueRotate}deg)
                      `,
                      transform: `
                        rotate(${state.rotate}deg)
                        scale(${state.horizontal}, ${state.vertical})
                      `,
                    }}
                  />
                )
              ) : (
                <label htmlFor="choose">
                  <IoIosImage />
                  <span>Choose Image</span>
                </label>
              )}
            </div>
            <div className="image_select">
              <button className="redo" onClick={undo}>
                <IoMdUndo />
              </button>
              <button className="undo" onClick={redo}>
                <IoMdRedo />
              </button>
              {isCropping ? (
                <button className="crop" onClick={cropImage}>
                  Apply Crop
                </button>
              ) : (
                <button className="crop" onClick={startCropImage}>
                  Crop Image
                </button>
              )}
              <label htmlFor="choose">Choose Image</label>
              <input type="file" id="choose" onChange={imageHandler} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
