import React, { useEffect, useMemo, useRef, useState } from "react";

const useSsr = <T extends () => any>(fn: T) => {
    const [state, setState] = useState<ReturnType<T> | null>(null);
    useEffect(() => setState(fn), []);
    return state;
};

type IframeNativeProps = React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;

type Actions = { [K in string]: (args: { type: string } & any) => EventReturn };

type Primitives = string | number | null | boolean;

type JsonObject = Record<string, Primitives | Primitives[] | JsonObject[] | {}>;

type EventReturn = Promise<any> | any | void | Promise<void>;

type Generic = { [K: string]: (arg: Record<string, any>) => EventReturn };

type CreateIframeEvents<T extends Record<string, any>> = {
    [K in keyof T]: (args: { type: T } & T[K]) => EventReturn;
};

export type IFrameProps<A extends Actions = Generic> = Omit<IframeNativeProps, "src"> & {
    src: string;
    actions?: A;
};

export const IFrame = <T extends Actions>({ actions, ...props }: IFrameProps<T>) => {
    const origin = useMemo(() => (props.src === "" ? "" : new URL(props.src as string).origin), [props.src]);
    const actionsRef = useRef<T>(actions ?? ({} as any));
    const name = useSsr(() => window.location.origin);
    useEffect(() => void (actionsRef.current = actions ?? ({} as any)), [actions]);
    useEffect(() => {
        const listener = (e: MessageEvent<string>) => {
            if (e.origin !== origin) return;
            const data: any = JSON.parse(e.data);
            const type = data.type;
            if (typeof actionsRef.current[type] === "function") return actionsRef.current[type]!(data);
        };
        window.addEventListener("message", listener, false);
        return () => window.removeEventListener("message", listener, false);
    }, [origin]);
    return name ? <iframe {...props} name={name} src={props.src as string} /> : null;
};

type IframeEvents = CreateIframeEvents<{
    type: { data: number[] };
    testing: { data: { a: number[] } };
}>;

const El = (
    <IFrame
        src="https://ok.com"
        actions={{
            type: (args) => {
                args.type;
                args.data;
            },
            testing: (args) => {
                args.data.a;
            },
        }}
    />
);

const Element = (
    <IFrame<IframeEvents>
        src="https://ok.com"
        actions={{
            type: (args) => {
                args.type;
                args.data;
            },
            testing: (args) => {
                args.data.a;
            },
        }}
    />
);
