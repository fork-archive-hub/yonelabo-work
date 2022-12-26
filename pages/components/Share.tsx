import React, { useRef, useState, FC } from "react";
import SignaturePad from "react-signature-pad-wrapper"
import { TinyliciousClient, TinyliciousClientProps } from "@fluidframework/tinylicious-client";
import { SharedMap } from "fluid-framework";
import { Stage, Layer, Line, Text } from 'react-konva';
import Konva from "konva";

const dataKey = "drawing";
const containerSchema = {
    initialObjects: { view: SharedMap }
};

const clientProps: TinyliciousClientProps = {}
// const clientProps: TinyliciousClientProps = {
//   connection: { port: 443, domain: "" }
// }
const client = new TinyliciousClient(clientProps);

const getViewData = async (): Promise<SharedMap> => {
    let container;
    const containerId = window.location.hash.substring(1);
    if (!containerId) {
        ({ container } = await client.createContainer(containerSchema));
        const id = await container.attach();
        window.location.hash = id;
    } else {
        ({ container } = await client.getContainer(containerId, containerSchema));
    }

    return container.initialObjects.view as SharedMap;
}

const Share: FC = () => {
    const signaturePadRef = useRef<SignaturePad>(null);
    const stageRef = useRef<Konva.>(null);

    const [fluidData, setFluidData] = useState<SharedMap>();
    React.useEffect(() => {
        getViewData().then(view => setFluidData(view));
    }, []);

    React.useEffect(() => {
        if (!fluidData) {
            return;
        }

        const syncView = () => {
            const data = fluidData.get(dataKey);
            console.log("333", data)
            if (signaturePadRef.current) {
                signaturePadRef.current.fromDataURL(stageRef.current.toDataURL());
            }
        }

        syncView();
        fluidData.on("valueChanged", syncView);
        return () => { fluidData.off("valueChanged", syncView) }
    }, [fluidData]);

    const [imageData, setImageData] = React.useState<string>();
    React.useEffect(() => {
        console.log("hhh", imageData)
        if (imageData) {
            fluidData?.set(dataKey, imageData);
        }
    }, [imageData, fluidData]);

    // ここのonEndを変更する
    // const onEnd = React.useCallback(() => {
    //     const signaturePad = signaturePadRef.current;
    //     const dataUrl = signaturePad?.toDataURL("image/svg+xml");
    //     setImageData(dataUrl);
    // }, [setImageData]);



    const [lines, setLines] = useState([]);
    const [tool, setTool] = useState('pen');
    const isDrawing = useRef(false);
    const handleMouseDown = (e: any) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    };
    const handleMouseMove = (e: any) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        let lastLine = lines[lines.length - 1];
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // replace last
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };
    const handleMouseUp = () => {
        console.log("描き終わり")
        // const temp = stageRef.current
        const uri = stageRef.current.toDataURL(
            { mimeType: "image/svg+xml", }
        );
        console.log(uri);
        setImageData(uri);
        isDrawing.current = false;
    };

    return (
        // <SignaturePad ref={signaturePadRef} options={{onEnd: onEnd}} />
        <div>
            {/* <img src={fluidData.get(dataKey)}></img> */}
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                ref={stageRef}
            >
                <Layer>
                    <Text text="Just start drawing" x={5} y={30} />
                    {lines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke="#df4b26"
                            strokeWidth={5}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={
                                line.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}

export default Share;