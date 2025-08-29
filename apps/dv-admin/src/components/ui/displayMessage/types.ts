type TypeMessage = "success" | "error";
export interface IProps {
	typeMessage?: TypeMessage;
	timeout?: number;
	isShowIcon?: boolean;
}
