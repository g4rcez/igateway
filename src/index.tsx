import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Nullable<T> = T | null;

export const has = <T extends {}, K extends keyof T>(o: T, k: K): k is K => Object.prototype.hasOwnProperty.call(o, k);

export const useListener = <Origin extends string, Listeners extends Record<string, (data: any) => any | Promise<any>>>(
    origin: Origin,
    listeners: Listeners
) => {
    const ref = useRef(listeners);

    useEffect(() => void (ref.current = listeners), [listeners]);

    useEffect(() => {
        const fn = async (e: MessageEvent<string>) => {
            if (e.origin !== origin) return;
            const data: any = JSON.parse(e.data);
            if (!has(ref.current, data.type)) return;
            await ref.current[data.type](data);
        };
        window.addEventListener("message", fn, false);
        return () => window.removeEventListener("message", fn, false);
    }, [origin]);
};

type IframeProps = React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;

type Primitives = string | null | undefined | boolean | Date | number | bigint;

type PrimitiveObject<T extends any = any> = {
    [Key: string]: Primitives | Array<PrimitiveObject<T>> | PrimitiveObject<T>;
};

type Data<T extends PrimitiveObject = {}> = T & {
    type: string;
};

export const useIframeDocument = (src: Nullable<string>) => {
    const iframe = useRef<HTMLIFrameElement>(null);
    const [state, setState] = useState(() => ({ loaded: false, style: { height: 0 } as CSSProperties }));

    const dispatcher = useMemo(
        () =>
            <T extends Data>(message: string, data: T) =>
                iframe.current?.contentWindow?.postMessage(JSON.stringify(data), "*"),
        []
    );

    const Iframe = useCallback(
        (props: Omit<IframeProps, "src">) => (
            <iframe {...props} key={`hook-iframe-${src}`} ref={iframe} hidden={src === null} src={src ?? ""} style={{ ...state.style, ...props }} />
        ),
        [src, state]
    );

    useEffect(() => {
        if (iframe.current === null) return;
        iframe.current.addEventListener("load", (event: any) => {
            const iframe = event.currentTarget;
            try {
                const newValue = iframe.contentWindow?.document.body.offsetHeight;
                if (newValue !== undefined) setState({ loaded: true, style: { height: `${newValue}px` } });
            } catch (e) {
                setState({ loaded: true, style: { height: `${window.outerHeight * 2}px` } });
            }
        });
    }, []);

    return { loaded: state.loaded, Iframe, post: dispatcher };
};
