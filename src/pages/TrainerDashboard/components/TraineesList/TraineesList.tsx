import { ProfileCard } from "../../../../components/ProfileCard/ProfileCard";
import { User } from "../../../../types/user/User";

export function TraineesList({ trainees }: { trainees: User[] }) {
    return (
        <div className="trainees-list-container">
            {trainees.map((trainee) => (
                <ProfileCard key={trainee._id} userToDisplay={trainee} />
            ))}
        </div>
    )
}