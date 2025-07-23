import React, { useState, CSSProperties, useEffect } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type PickerMode = "date" | "time" | "datetime";

interface BasePickerProps {
    label?: string;
    date: Date;
    onDateChange: (date: Date) => void;
    placeholder?: string;
    disabled?: boolean;
    buttonStyle?: object;
    buttonTextStyle?: object;
    labelStyle?: object;
    containerStyle?: object;
}

interface DatePickerProps extends BasePickerProps {
    minimumDate?: Date;
    maximumDate?: Date;
    dateFormat?: string;
}

interface TimePickerProps extends BasePickerProps {
    is24Hour?: boolean;
    minuteInterval?: 1 | 5 | 10 | 15 | 20 | 30;
    timeFormat?: string;
}
interface DateTimePickerProps extends BasePickerProps {
    minimumDate?: Date;
    maximumDate?: Date;
    is24Hour?: boolean;
    minuteInterval?: 1 | 5 | 10 | 15 | 20 | 30;
    dateTimeFormat?: string;
}

const BasePicker = ({
    label,
    date,
    onDateChange,
    placeholder,
    disabled = false,
    minimumDate,
    maximumDate,
    buttonStyle,
    buttonTextStyle,
    labelStyle,
    containerStyle,
    mode,
    is24Hour = false,
    minuteInterval = 1,
}: BasePickerProps & {
    mode: PickerMode;
    is24Hour?: boolean;
    minuteInterval?: 1 | 5 | 10 | 15 | 20 | 30;
    minimumDate?: Date;
    maximumDate?: Date;
}) => {
    const [isVisible, setVisible] = useState<boolean>(false);
    const [value, setValue] = useState<Date>(date);

    useEffect(() => {
        if (date instanceof Date && !isNaN(date.getTime())) {
            setValue(date);
        }
    }, [date]);

    const showPicker = () => {
        if (!disabled) {
            setVisible(true);
        }
    };

    const handleConfirm = (selected: Date) => {
        if (selected instanceof Date && !isNaN(selected.getTime())) {
            if (mode === "time") {
                const updated = new Date(value);
                updated.setHours(selected.getHours());
                updated.setMinutes(selected.getMinutes());
                updated.setSeconds(selected.getSeconds());
                setValue(updated);
                onDateChange && onDateChange(updated);
            } else {
                setValue(selected);
                onDateChange && onDateChange(selected);
            }
        }
        setVisible(false)
    };

    const formatDisplay = (d: Date): string => {
        if (!(d instanceof Date) || isNaN(d.getTime())) {
            return placeholder || "";
        }

        switch (mode) {
            case "time":
                return d.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: !is24Hour
                });
            case "datetime":
                return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: !is24Hour
                })}`;
            case "date":
            default:
                return d.toLocaleDateString();
        }
    };

    const formatForWeb = (d: Date, type: PickerMode): string => {
        if (!(d instanceof Date) || isNaN(d.getTime())) {
            return "";
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        switch (type) {
            case "time":
                return `${hours}:${minutes}`;
            case "datetime":
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            case "date":
            default:
                return `${year}-${month}-${day}`;
        }
    };

    const parseWebInput = (input: string, type: PickerMode): Date => {
        try {
            let newDate = new Date(value);

            if (type === "time") {
                const [hours, minutes] = input.split(':').map(Number);
                newDate.setHours(hours, minutes, 0);
            }
            else if (type === "datetime") {
                const [datePart, timePart] = input.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);

                newDate = new Date();
                newDate.setFullYear(year);
                newDate.setMonth(month - 1);
                newDate.setDate(day);
                newDate.setHours(hours, minutes, 0);
            }
            else {
                const [year, month, day] = input.split('-').map(Number);
                newDate.setFullYear(year);
                newDate.setMonth(month - 1);
                newDate.setDate(day);
            }

            return !isNaN(newDate.getTime()) ? newDate : value;
        } catch (e) {
            return value;
        }
    };

    const handleWebChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.value) {
            const newDate = parseWebInput(e.target.value, mode);
            setValue(newDate);
            onDateChange && onDateChange(newDate);
        }
        setVisible(false);
    };

    const getWebInputProps = () => {
        const inputProps = {
            type: mode === "time" ? "time" : mode === "datetime" ? "datetime-local" : "date",
            value: formatForWeb(value, mode),
            onChange: handleWebChange,
            disabled,
            min: mode !== "time" && minimumDate ? formatForWeb(minimumDate, mode) : undefined,
            max: mode !== "time" && maximumDate ? formatForWeb(maximumDate, mode) : undefined,
        };
        return inputProps;
    };

    if (Platform.OS === "web") {
        const webContainerStyle: CSSProperties = { position: "relative", width: "100%" };
        const webInputStyle: CSSProperties = {
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            width: "100%",
            boxSizing: "border-box",
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? "not-allowed" : "pointer"
        };

        const inputProps = getWebInputProps();

        return (
            <View style={[styles.container, containerStyle]}>
                {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
                <div style={webContainerStyle}>
                    <input {...inputProps} style={webInputStyle} />
                </div>
            </View>
        );
    }

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
            <TouchableOpacity
                onPress={showPicker}
                disabled={disabled}
                style={[
                    styles.dateButton,
                    buttonStyle,
                    disabled && styles.disabledButton,
                ]}
            >
                <Text style={[styles.dateText, buttonTextStyle]}>
                    {formatDisplay(value)}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={isVisible}
                mode={mode}
                onConfirm={handleConfirm}
                onCancel={() => setVisible(false)}
                date={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                is24Hour={is24Hour}
                minuteInterval={minuteInterval}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            />
        </View>
    );
};

export const DatePicker: React.FC<DatePickerProps> = ({
    label = "Select Date",
    placeholder = "Select a date",
    ...props
}) => (
    <BasePicker mode="date" label={label} placeholder={placeholder} {...props} />
);

export const TimePicker: React.FC<TimePickerProps> = ({
    label = "Select Time",
    placeholder = "Select a time",
    ...props
}) => (
    <BasePicker mode="time" label={label} placeholder={placeholder} {...props} />
);

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    label = "Select Date & Time",
    placeholder = "Select date and time",
    ...props
}) => (
    <BasePicker mode="datetime" label={label} placeholder={placeholder}{...props} />
);

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "500",
    },
    dateButton: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    dateText: {
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
});
export default DatePicker;