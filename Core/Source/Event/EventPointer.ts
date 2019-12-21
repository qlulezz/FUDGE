namespace FudgeCore {
    export const enum EVENT_POINTER {
        UP = "ƒpointerup",
        DOWN = "ƒpointerdown",
        MOVE = "ƒpointermove",
        OVER = "ƒpointerover",
        ENTER = "ƒpointerenter",
        CANCEL = "ƒpointercancel",
        OUT = "ƒpointerout",
        LEAVE = "ƒpointerleave",
        GOTCAPTURE = "ƒgotpointercapture",
        LOSTCAPTURE = "ƒlostpointercapture"
    }

    export class PointerEventƒ extends PointerEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: PointerEventƒ) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
}